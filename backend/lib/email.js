// Email relay. The provider boundary is rawSend() — it is the ONLY function that
// knows which transactional provider we use. Swapping providers is a one-function
// change; nothing else in this file (templates, links, footers, headers) cares.
//
// Three send modes:
//  - DOI confirmation email (kit or dispatch source)
//  - "Already confirmed" kit delivery email (skip DOI for returning kit subscribers)
//  - Newsletter send (one recipient per call; caller batches + throttles)

const FROM = `${process.env.MAIL_FROM_NAME || 'Gaurav Trivedi'} <${process.env.MAIL_FROM_EMAIL}>`;
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONFIRM_BASE = 'https://sbzzbnh7me.execute-api.us-east-1.amazonaws.com/confirm';
const UNSUB_BASE = process.env.UNSUBSCRIBE_BASE_URL || 'https://sbzzbnh7me.execute-api.us-east-1.amazonaws.com/unsubscribe';
const KIT_REDIRECT = process.env.CONFIRM_REDIRECT_KIT;
const KIT_URL = process.env.KIT_PUBLIC_URL;

function confirmLink({ email, source, expiry, token, dest }) {
  const params = new URLSearchParams({ email, source, expiry: String(expiry), token, dest });
  return `${CONFIRM_BASE}?${params.toString()}`;
}

function unsubscribeLink({ email, token }) {
  const params = new URLSearchParams({ email, token });
  return `${UNSUB_BASE}?${params.toString()}`;
}

// === PROVIDER BOUNDARY ===
// Sends one email via Resend's REST API. `headers` is a plain object of custom
// SMTP headers (e.g. List-Unsubscribe). To move to another provider, this is the
// only function you rewrite.
async function rawSend({ to, subject, htmlBody, textBody, headers = {} }) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');
  const resp = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      html: htmlBody,
      text: textBody,
      headers,
    }),
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    throw new Error(`Resend send failed (${resp.status}): ${detail}`);
  }
  return resp.json();
}

async function sendKitDoi({ to, source, expiry, token, dest }) {
  const link = confirmLink({ email: to, source, expiry, token, dest });
  const subject = 'Confirm to unlock the survival kit';
  const textBody = [
    'One click and the briefing is yours.',
    '',
    `Confirm and download: ${link}`,
    '',
    'You will also start receiving the weekly dispatch:',
    'operational breakdowns of AI documentation workflows.',
    'No generic recaps.',
    '',
    `If you did not request this, ignore the email. Nothing happens.`,
  ].join('\n');
  const htmlBody = `<!doctype html><html><body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fafafa;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eaecef;border-radius:12px;padding:32px;">
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">One click and the briefing is yours.</p>
    <p style="margin:0 0 28px;">
      <a href="${link}" style="display:inline-block;background:#5B8DEF;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">Confirm and download</a>
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#444;">You will also start receiving the weekly dispatch: operational breakdowns of AI documentation workflows. No generic recaps.</p>
    <p style="margin:24px 0 0;font-size:12px;color:#888;line-height:1.5;">If you did not request this, ignore the email. Nothing happens.</p>
  </div>
</body></html>`;
  return rawSend({ to, subject, htmlBody, textBody });
}

async function sendDispatchDoi({ to, source, expiry, token, dest }) {
  const link = confirmLink({ email: to, source, expiry, token, dest });
  const subject = 'Confirm to join the dispatch';
  const textBody = [
    'One essay every other Sunday. Slow, considered, no filler.',
    '',
    `Confirm your subscription: ${link}`,
    '',
    `If you did not request this, ignore the email. Nothing happens.`,
  ].join('\n');
  const htmlBody = `<!doctype html><html><body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fafafa;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eaecef;border-radius:12px;padding:32px;">
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">One essay every other Sunday. Slow, considered, no filler.</p>
    <p style="margin:0 0 28px;">
      <a href="${link}" style="display:inline-block;background:#5B8DEF;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">Confirm subscription</a>
    </p>
    <p style="margin:24px 0 0;font-size:12px;color:#888;line-height:1.5;">If you did not request this, ignore the email. Nothing happens.</p>
  </div>
</body></html>`;
  return rawSend({ to, subject, htmlBody, textBody });
}

// Newsletter send to a SINGLE recipient. Caller batches.
// Subject, htmlBody, textBody are pre-rendered (lib/render.js).
async function sendNewsletter({ to, subject, htmlBody, textBody, unsubscribeToken }) {
  const unsubUrl = unsubscribeLink({ email: to, token: unsubscribeToken });
  // Append unsubscribe footer if the rendered HTML doesn't already contain one.
  // (Newsletter HTML should typically include {{unsubscribe_url}} explicitly,
  // but we belt-and-suspenders it here to guarantee CAN-SPAM compliance.)
  const htmlWithFooter = htmlBody.includes('{{unsubscribe_url}}')
    ? htmlBody.replaceAll('{{unsubscribe_url}}', unsubUrl)
    : `${htmlBody}\n<p style="margin:32px 0 0;font-size:12px;color:#888;text-align:center;"><a href="${unsubUrl}" style="color:#888;">Unsubscribe</a></p>`;
  const textWithFooter = textBody.includes('{{unsubscribe_url}}')
    ? textBody.replaceAll('{{unsubscribe_url}}', unsubUrl)
    : `${textBody}\n\nUnsubscribe: ${unsubUrl}`;
  return rawSend({
    to,
    subject,
    htmlBody: htmlWithFooter,
    textBody: textWithFooter,
    // List-Unsubscribe header for one-click unsub in Gmail/Outlook (Gmail 2024 requirement
    // for bulk senders alongside SPF+DKIM+DMARC).
    headers: {
      'List-Unsubscribe': `<${unsubUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });
}

module.exports = { sendKitDoi, sendDispatchDoi, sendNewsletter, confirmLink, unsubscribeLink };
