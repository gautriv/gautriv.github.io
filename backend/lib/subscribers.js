// Subscriber store: one JSON object per subscriber on S3.
// Path: s3://{bucket}/private/subscribers/{sha256(email)[:16]}.json
// Bucket policy keeps the `private/` prefix locked from public read; only `dl/`
// is public-read for the kit PDF.

const crypto = require('node:crypto');
const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: 'us-east-1' });
const BUCKET = process.env.S3_BUCKET_NAME;
const PREFIX = 'private/subscribers/';

function keyFor(email) {
  const hash = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 16);
  return `${PREFIX}${hash}.json`;
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

// Returns the subscriber record or null. NoSuchKey is treated as "not present".
async function get(email) {
  const key = keyFor(email);
  try {
    const resp = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const body = await streamToString(resp.Body);
    return JSON.parse(body);
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) return null;
    throw err;
  }
}

// Idempotent upsert. Caller passes the full record shape.
async function put(record) {
  if (!record || !record.email) throw new Error('subscriber record missing email');
  const key = keyFor(record.email);
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(record),
    ContentType: 'application/json',
  }));
  return record;
}

// Mark an existing subscriber as unsubscribed. Returns null if they weren't a
// subscriber to begin with (still considered a no-op success — idempotent).
async function markUnsubscribed(email, { complaint = false } = {}) {
  const existing = await get(email);
  if (!existing) return null;
  const updated = {
    ...existing,
    unsubscribed_at: new Date().toISOString(),
    ...(complaint ? { complaint: true } : {}),
  };
  await put(updated);
  return updated;
}

// Re-confirm an existing subscriber (re-opt-in clears any prior unsubscribe).
// Used in the confirm-handler path after DOI succeeds.
async function confirm({ email, source }) {
  const existing = await get(email);
  const record = {
    email: email.trim().toLowerCase(),
    confirmed_at: new Date().toISOString(),
    source: source || existing?.source || 'unknown',
    unsubscribed_at: null,
    ...(existing?.complaint ? { complaint: true } : {}),
  };
  await put(record);
  return record;
}

// List ALL active subscribers (filters out unsubscribed + complainers).
// Uses ListObjectsV2 pagination to handle large lists.
async function* listActive() {
  let ContinuationToken;
  do {
    const resp = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: PREFIX,
      ContinuationToken,
    }));
    for (const obj of resp.Contents || []) {
      try {
        const body = await streamToString((await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: obj.Key }))).Body);
        const record = JSON.parse(body);
        if (record.unsubscribed_at) continue;
        if (record.complaint) continue;
        yield record;
      } catch (err) {
        console.error('failed to read subscriber', obj.Key, err.message);
      }
    }
    ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (ContinuationToken);
}

module.exports = { get, put, confirm, markUnsubscribed, listActive, keyFor };
