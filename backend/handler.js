// SurvivalStackOptin — single Lambda serving 5 routes:
//   POST /                  → kit + dispatch opt-in (DOI flow)
//   GET  /confirm           → DOI magic-link confirm + redirect
//   GET  /unsubscribe       → mark subscriber unsubscribed
//   POST /send-newsletter   → render + batch-send newsletter (AWS_IAM-protected)
//   POST /resend-webhook    → Resend bounce/complaint events → auto-suppress

const token = require('./lib/token');
const blocklist = require('./lib/blocklist');
const subscribers = require('./lib/subscribers');
const email = require('./lib/email');
const render = require('./lib/render');
const github = require('./lib/github');
const webhook = require('./lib/webhook');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: 'us-east-1' });
const BUCKET = process.env.S3_BUCKET_NAME;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  'Content-Type': 'application/json',
};

const REDIRECT = {
  kit_optin: process.env.CONFIRM_REDIRECT_KIT,
  dispatch: process.env.CONFIRM_REDIRECT_DISPATCH,
};

const VALID_SOURCES = new Set(['kit_optin', 'dispatch']);

function method(event) {
  return event.httpMethod || event.requestContext?.http?.method || 'POST';
}
function path(event) {
  return event.rawPath || event.requestContext?.http?.path || '/';
}
function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return {}; }
}
function json(statusCode, payload) {
  return { statusCode, headers: CORS, body: JSON.stringify(payload) };
}
function html(statusCode, body) {
  return { statusCode, headers: { ...CORS, 'Content-Type': 'text/html; charset=utf-8' }, body };
}
function redirect(url) {
  return { statusCode: 302, headers: { ...CORS, Location: url }, body: '' };
}

// Lightweight HTML page for confirm-error states (expired token, bad signature).
function errorPage(title, message) {
  return html(400, `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:-apple-system,sans-serif;max-width:520px;margin:48px auto;padding:24px;color:#1a1a1a;line-height:1.6;}
h1{font-size:22px;color:#ef4444;}a{color:#5B8DEF;}</style></head>
<body><h1>${title}</h1><p>${message}</p>
<p><a href="https://beingtechnicalwriter.com/survival-stack.html">Request the kit again</a> or <a href="https://beingtechnicalwriter.com/">return to the site</a>.</p>
</body></html>`);
}

// =========== POST / : opt-in flow ===========

async function handleOptin(event) {
  const body = parseBody(event);
  const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const source = body.source || 'kit_optin';

  if (!VALID_SOURCES.has(source)) {
    return json(400, { error: 'Invalid source.' });
  }
  if (!blocklist.isPlausibleEmail(rawEmail)) {
    return json(400, { error: 'Please enter a real email address.' });
  }
  if (blocklist.isDisposable(rawEmail)) {
    return json(400, { error: 'Disposable inboxes can\'t receive the kit. Use a real address.' });
  }

  const existing = await subscribers.get(rawEmail).catch((err) => {
    console.error('subscribers.get failed', err);
    return null;
  });

  // Already-confirmed shortcut: never send a second email. Returning kit users get
  // a redirect URL straight to the kit page (the frontend handles the bounce).
  // Returning dispatch users just see an inline "you're already in" message.
  if (existing && !existing.unsubscribed_at && !existing.complaint) {
    const redirectUrl = source === 'kit_optin' ? REDIRECT.kit_optin : null;
    return json(200, { success: true, alreadyConfirmed: true, redirectUrl });
  }

  // New (or re-opting-in after unsubscribe) → DOI flow.
  const dest = REDIRECT[source];
  const { token: tok, expiry } = token.sign({ email: rawEmail, source, dest });
  try {
    if (source === 'kit_optin') {
      await email.sendKitDoi({ to: rawEmail, source, expiry, token: tok, dest });
    } else {
      await email.sendDispatchDoi({ to: rawEmail, source, expiry, token: tok, dest });
    }
  } catch (err) {
    console.error('DOI send failed', err);
    return json(502, { error: 'Email service hiccup. Try again in a moment.' });
  }
  return json(200, { success: true, pending: true });
}

// =========== GET /confirm : magic-link confirm ===========

async function handleConfirm(event) {
  const qs = event.queryStringParameters || {};
  const { email: rawEmail, source, dest, expiry, token: tok } = qs;
  if (!rawEmail || !source || !expiry || !tok) {
    return errorPage('Bad confirmation link', 'The link is missing required parameters.');
  }
  if (!VALID_SOURCES.has(source)) {
    return errorPage('Bad confirmation link', 'Unknown source.');
  }
  const result = token.verify({ email: rawEmail, source, dest, expiry, token: tok });
  if (!result.ok) {
    if (result.reason === 'expired') {
      return errorPage('Link expired', 'This confirmation link expired (24 hours). Request a fresh one.');
    }
    return errorPage('Invalid link', 'This confirmation link is not valid.');
  }

  try {
    await subscribers.confirm({ email: rawEmail, source });
  } catch (err) {
    console.error('subscribers.confirm failed', err);
    return errorPage('Subscription saved offline', 'We confirmed your email but our store hiccuped. We will reach out manually.');
  }

  const target = REDIRECT[source] || dest || 'https://beingtechnicalwriter.com/';
  return redirect(target);
}

// =========== GET /unsubscribe : mark unsubscribed ===========

async function handleUnsubscribe(event) {
  const qs = event.queryStringParameters || {};
  const { email: rawEmail, token: tok } = qs;
  if (!rawEmail || !tok) {
    return errorPage('Bad unsubscribe link', 'The link is missing required parameters.');
  }
  // Unsubscribe tokens are HMAC of just the email (no expiry — unsubscribe links
  // in old newsletters should still work).
  const expected = require('node:crypto')
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(`unsubscribe|${rawEmail.toLowerCase()}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (expected !== tok) {
    return errorPage('Invalid unsubscribe link', 'This link does not match. If you keep getting our emails, reply directly and we will remove you.');
  }

  try {
    await subscribers.markUnsubscribed(rawEmail);
  } catch (err) {
    console.error('markUnsubscribed failed', err);
    return errorPage('Could not unsubscribe right now', 'Reply to any of our emails and we will remove you manually.');
  }

  return html(200, `<!doctype html><html><head><meta charset="utf-8"><title>Unsubscribed</title>
<style>body{font-family:-apple-system,sans-serif;max-width:520px;margin:48px auto;padding:24px;color:#1a1a1a;line-height:1.6;}
h1{font-size:22px;color:#10b981;}a{color:#5B8DEF;}</style></head>
<body><h1>Unsubscribed</h1>
<p>You will no longer receive emails from this list. Sorry to see you go.</p>
<p>If you change your mind, <a href="https://beingtechnicalwriter.com/survival-stack.html">opt back in here</a>.</p>
</body></html>`);
}

// HMAC for unsubscribe links — included in newsletter sends.
function unsubscribeToken(emailAddress) {
  return require('node:crypto')
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(`unsubscribe|${emailAddress.toLowerCase()}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// =========== POST /send-newsletter : render + batch send ===========

// Resend default rate: 5 requests/sec per team. Throttle below it for headroom.
const SEND_RATE_PER_SEC = 4;

async function handleSendNewsletter(event) {
  const body = parseBody(event);
  const { filepath, test } = body;
  if (!filepath) return json(400, { error: 'filepath required' });

  let source;
  try {
    source = await github.fetchNewsletterSource(filepath);
  } catch (err) {
    console.error('GitHub fetch failed', err);
    return json(502, { error: `Could not fetch ${filepath}: ${err.message}` });
  }

  let rendered;
  try {
    rendered = render.renderNewsletter(source);
  } catch (err) {
    console.error('render failed', err);
    return json(400, { error: `Render failed: ${err.message}` });
  }

  const { subject, htmlBody, textBody } = rendered;

  // --test=email@x.com : send to single recipient, skip the audience.
  if (test) {
    if (!blocklist.isPlausibleEmail(test)) {
      return json(400, { error: 'invalid --test email' });
    }
    try {
      await email.sendNewsletter({
        to: test,
        subject,
        htmlBody,
        textBody,
        unsubscribeToken: unsubscribeToken(test),
      });
    } catch (err) {
      console.error('test send failed', err);
      return json(502, { error: `Test send failed: ${err.message}` });
    }
    return json(200, { success: true, test, subject });
  }

  // Live send to all active subscribers.
  const startedAt = new Date().toISOString();
  let sent = 0;
  let failed = 0;
  const failures = [];
  let lastSendAt = 0;

  for await (const sub of subscribers.listActive()) {
    // Simple per-message throttle: ensure (now - lastSend) >= 1000/RATE.
    const minGap = Math.floor(1000 / SEND_RATE_PER_SEC);
    const wait = lastSendAt + minGap - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));

    try {
      await email.sendNewsletter({
        to: sub.email,
        subject,
        htmlBody,
        textBody,
        unsubscribeToken: unsubscribeToken(sub.email),
      });
      sent++;
    } catch (err) {
      failed++;
      failures.push({ email: sub.email, error: err.message });
      console.error('newsletter send failed for', sub.email, err.message);
    }
    lastSendAt = Date.now();
  }

  const finishedAt = new Date().toISOString();
  const slug = filepath.replace(/^_newsletters\//, '').replace(/\.md$/, '');
  const logKey = `private/sends/${slug}.json`;
  const logBody = JSON.stringify({ filepath, subject, sent, failed, failures: failures.slice(0, 20), startedAt, finishedAt }, null, 2);
  try {
    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: logKey, Body: logBody, ContentType: 'application/json' }));
  } catch (err) {
    console.error('failed to write send log', err);
  }

  return json(200, { success: true, sent, failed, startedAt, finishedAt });
}

// =========== POST /resend-webhook : bounce/complaint auto-suppression ===========

// Replaces the old SES → SNS → SurvivalKitBounceHandler path. Resend posts
// Svix-signed events here; we verify the signature and prune the subscriber store
// so sender reputation stays healthy.
async function handleResendWebhook(event) {
  // Svix signs the RAW body — verify before parsing.
  const rawBody = event.body
    ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body)
    : '';
  const h = event.headers || {};

  let evt;
  try {
    evt = webhook.verify({
      rawBody,
      headers: {
        'svix-id': h['svix-id'],
        'svix-timestamp': h['svix-timestamp'],
        'svix-signature': h['svix-signature'],
      },
      secret: process.env.RESEND_WEBHOOK_SECRET,
    });
  } catch (err) {
    console.error('webhook verify failed:', err.message);
    return json(401, { error: 'invalid signature' });
  }

  const type = evt.type;
  const to = evt.data?.to;
  const recipients = Array.isArray(to) ? to : (to ? [to] : []);

  if (type === 'email.bounced') {
    // Resend fires email.bounced for permanent rejections; transient issues come
    // through email.delivery_delayed. Suppress unless explicitly tagged Transient.
    const bounceType = evt.data?.bounce?.type;
    if (bounceType && bounceType !== 'Permanent') {
      console.log('Ignoring non-permanent bounce:', bounceType);
      return json(200, { ok: true, ignored: 'transient-bounce' });
    }
    for (const r of recipients) await prune(r, { complaint: false, reason: 'bounce' });
  } else if (type === 'email.complained') {
    // Spam-marked: harshest signal. Never email this address again, even on re-opt-in.
    for (const r of recipients) await prune(r, { complaint: true, reason: 'complaint' });
  } else {
    // delivered / opened / clicked / etc — informational, no state change.
    console.log('Webhook event (no-op):', type);
  }

  return json(200, { ok: true });
}

async function prune(emailAddress, { complaint, reason }) {
  if (!emailAddress) return;
  try {
    const result = await subscribers.markUnsubscribed(emailAddress, { complaint });
    console.log(result
      ? `Pruned ${emailAddress} (${reason})`
      : `No subscriber for ${emailAddress} (${reason}) — no-op`);
  } catch (err) {
    console.error(`Failed to prune ${emailAddress}`, err);
  }
}

// =========== Router ===========

exports.handler = async (event) => {
  const m = method(event);
  const p = path(event);

  if (m === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  try {
    if (m === 'POST' && (p === '/' || p === '')) return await handleOptin(event);
    if (m === 'GET' && p === '/confirm') return await handleConfirm(event);
    if (m === 'GET' && p === '/unsubscribe') return await handleUnsubscribe(event);
    if (m === 'POST' && p === '/send-newsletter') return await handleSendNewsletter(event);
    if (m === 'POST' && p === '/resend-webhook') return await handleResendWebhook(event);
    return json(404, { error: `Unknown route: ${m} ${p}` });
  } catch (err) {
    console.error('handler error', err && err.stack ? err.stack : err);
    return json(500, { error: 'Internal server error.' });
  }
};
