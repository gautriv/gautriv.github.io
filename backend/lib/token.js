// HMAC-SHA256 magic-link token. Stateless: contents are signed, not encrypted.
// Anyone can read the token; only someone with JWT_SECRET can forge one.

const crypto = require('node:crypto');

const SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 32) {
  console.warn('JWT_SECRET missing or too short (<32 chars). HMAC will be weak.');
}

// Default TTL: 24 hours. Plenty for user to check inbox + click.
const DEFAULT_TTL_SECONDS = 60 * 60 * 24;

function base64urlEncode(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function hmac(payload) {
  return base64urlEncode(crypto.createHmac('sha256', SECRET).update(payload).digest());
}

// Encode { email, source, dest, expiry } into a URL-safe payload + signature.
// We pass the fields as separate query params (not bundled in a JWT-style blob)
// so the unsubscribe / confirm URLs stay debuggable when something goes wrong.
function sign({ email, source, dest, ttlSeconds = DEFAULT_TTL_SECONDS }) {
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = canonicalPayload({ email, source, dest, expiry });
  return { token: hmac(payload), expiry };
}

function verify({ email, source, dest, expiry, token }) {
  if (!email || !expiry || !token) return { ok: false, reason: 'missing fields' };

  const expiryNum = Number(expiry);
  if (!Number.isFinite(expiryNum)) return { ok: false, reason: 'expiry not a number' };
  if (expiryNum < Math.floor(Date.now() / 1000)) return { ok: false, reason: 'expired' };

  const expected = hmac(canonicalPayload({ email, source, dest, expiry: expiryNum }));
  // Constant-time compare. Equal-length precondition required for timingSafeEqual.
  if (expected.length !== token.length) return { ok: false, reason: 'hmac mismatch' };
  const match = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  return match ? { ok: true } : { ok: false, reason: 'hmac mismatch' };
}

// Canonical string for HMAC — lowercase email, strict field ordering, no escaping
// surprises. Both sign + verify call this so they stay in lockstep.
function canonicalPayload({ email, source, dest, expiry }) {
  return [
    String(email || '').trim().toLowerCase(),
    String(source || ''),
    String(dest || ''),
    String(expiry),
  ].join('|');
}

module.exports = { sign, verify, DEFAULT_TTL_SECONDS };
