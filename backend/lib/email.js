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

// Pure builder for the dispatch double-opt-in email: "The Frequency" world.
// Deterministic: given the same inputs it returns the same { subject, html, text },
// touches no network, so it can be previewed and unit-tested. The send wrapper below
// calls this, then hands the result to rawSend().
//
// Design notes (see plan): dark CARD (#0A0A0B) on a light backdrop (not a dark BODY,
// which degrades in Outlook), inline styles only, mono header/footer labels, ASCII-only
// motifs (G5: no emoji, no exotic glyphs, no em dash). The mysterious subject is a
// deliberate, logged trade against confirmation-email clarity; the preheader carries
// the action.
function renderDispatchDoi({ to, source, expiry, token, dest }) {
  const link = confirmLink({ email: to, source, expiry, token, dest });
  const subject = "This frequency isn't open yet";
  const preheader = "One click proves there's a real receiver on the other end.";

  const mono = "'SF Mono', Menlo, Consolas, monospace";
  const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  const text = [
    'INCOMING ///  BEING TECHNICAL WRITER',
    '',
    "Someone at this address tuned to a channel that doesn't advertise itself.",
    '',
    "Good instinct. Before I start transmitting, I need to know there's a real",
    'person receiving, and not a bot scraping its way through the dark.',
    '',
    'One click opens the channel:',
    link,
    '',
    'What lands here: one transmission every other Sunday. Field notes from two',
    'issues ahead of where you are in the AI documentation work. Operational.',
    'Specific. Occasionally funny. Never a recap.',
    '',
    "Don't recognize this signal? Let it decay. The link dies in 24 hours and",
    'takes every trace with it. You were never here.',
    '',
    '// transmitting from two issues ahead',
  ].join('\n');

  const html = `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:${sans};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f4f5;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f5" style="background:#f4f4f5;">
<tr><td align="center" style="padding:24px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;">
<tr><td bgcolor="#0A0A0B" style="background:#0A0A0B;border:1px solid #1c1f26;border-radius:16px;padding:34px 32px;color:#e6e9ef;font-family:${sans};">
  <p style="margin:0 0 6px;font-family:${mono};font-size:12px;letter-spacing:0.14em;color:#5B8DEF;">INCOMING ///</p>
  <p style="margin:0 0 22px;padding-bottom:18px;border-bottom:1px solid #1c1f26;font-family:${mono};font-size:12px;letter-spacing:0.14em;color:#9aa4b2;">BEING TECHNICAL WRITER</p>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#e6e9ef;">Someone at this address tuned to a channel that doesn't advertise itself.</p>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#e6e9ef;">Good instinct. Before I start transmitting, I need to know there's a real person receiving, and not a bot scraping its way through the dark.</p>
  <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#e6e9ef;">One click opens the channel.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px;"><tr>
    <td bgcolor="#5B8DEF" style="background:#5B8DEF;border-radius:8px;">
      <a href="${link}" style="display:inline-block;padding:14px 28px;font-family:${sans};font-size:15px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:8px;">Open the channel</a>
    </td>
  </tr></table>
  <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#9aa4b2;">What lands here: one transmission every other Sunday. Field notes from two issues ahead of where you are in the AI documentation work. Operational. Specific. Occasionally funny. Never a recap.</p>
  <p style="margin:0 0 26px;font-size:13px;line-height:1.6;color:#9aa4b2;">Don't recognize this signal? Let it decay. The link dies in 24 hours and takes every trace with it. You were never here.</p>
  <p style="margin:0;padding-top:18px;border-top:1px solid #1c1f26;font-family:${mono};font-size:11px;letter-spacing:0.08em;color:#5f6b7a;">// transmitting from two issues ahead</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}

async function sendDispatchDoi({ to, source, expiry, token, dest }) {
  const { subject, html, text } = renderDispatchDoi({ to, source, expiry, token, dest });
  return rawSend({ to, subject, htmlBody: html, textBody: text });
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

module.exports = { sendKitDoi, sendDispatchDoi, renderDispatchDoi, sendNewsletter, confirmLink, unsubscribeLink };
