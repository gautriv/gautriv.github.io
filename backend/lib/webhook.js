// Resend webhook verification. Resend signs webhooks with Svix (HMAC-SHA256).
// We verify manually with node:crypto so there's no SDK / svix dependency.
//
// Signed content = `${svix-id}.${svix-timestamp}.${rawBody}`
// Key            = base64-decoded portion of the `whsec_...` signing secret
// svix-signature = space-delimited list of `v1,<base64sig>` entries

const crypto = require('node:crypto');

const TOLERANCE_SECONDS = 5 * 60;

// Verifies a Resend webhook and returns the parsed event object.
// Throws on any verification failure — caller should return 401.
function verify({ rawBody, headers, secret }) {
  if (!secret) throw new Error('webhook secret not configured');

  const id = headers['svix-id'];
  const timestamp = headers['svix-timestamp'];
  const signatureHeader = headers['svix-signature'];
  if (!id || !timestamp || !signatureHeader) throw new Error('missing svix headers');

  // Reject stale deliveries (replay protection).
  const now = Math.floor(Date.now() / 1000);
  const ts = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > TOLERANCE_SECONDS) {
    throw new Error('webhook timestamp outside tolerance');
  }

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');
  const expectedBuf = Buffer.from(expected);

  // Header may carry multiple versioned signatures: "v1,<sig> v1,<sig2>".
  const matched = signatureHeader.split(' ').some((entry) => {
    const comma = entry.indexOf(',');
    const sig = comma === -1 ? entry : entry.slice(comma + 1);
    if (!sig) return false;
    const sigBuf = Buffer.from(sig);
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  });
  if (!matched) throw new Error('webhook signature mismatch');

  return JSON.parse(rawBody);
}

module.exports = { verify };
