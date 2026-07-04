// Markdown → email-safe HTML. Strips front matter, renders body via marked,
// inlines CSS via juice so older mail clients (Outlook, Yahoo) render correctly.

const { marked } = require('marked');
const juice = require('juice');

// Minimal in-house front-matter parser. Avoids pulling in gray-matter just for this.
// Accepts YAML-style key: value lines between two `---` fences.
function parseFrontMatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { data: {}, body: source };
  const yaml = match[1];
  const body = match[2];
  const data = {};
  for (const line of yaml.split('\n')) {
    const m = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let value = m[2].trim();
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (/^-?\d+$/.test(value)) value = Number(value);
    else if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    data[key] = value;
  }
  return { data, body };
}

const FRAGMENT_TOTAL_DEFAULT = 6;
const FRAGMENT_NOTE = "Six transmissions, six fragments, in order. Assembled they open a page I have linked from nowhere. Spacing and case don't matter.";
const pad2 = (n) => String(Number(n) || 0).padStart(2, '0');

// Build the signal-fragment "reward" in BOTH html (the email card) and plain text.
// The fragment is content, not chrome: a text-only reader must still receive it or
// the collect-six game silently excludes them. Returns empty strings when no
// fragment is set (graceful omission, G7). Fragment count is a parameter (G1).
function signalFragment({ transmission, fragment, fragmentTotal = FRAGMENT_TOTAL_DEFAULT }) {
  if (!fragment) return { html: '', text: '' };
  const counter = `${pad2(transmission)} / ${pad2(fragmentTotal)}`;
  // Table + bgcolor (not a CSS-only background) so the dark reward box still
  // renders in Outlook, where div backgrounds are dropped. It is the game payoff;
  // it cannot be allowed to vanish into white.
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:40px 0 0;"><tr>
  <td bgcolor="#0A0A0B" style="background:#0A0A0B;border:1px solid #1c1f26;border-radius:12px;padding:22px 24px;">
    <p class="sf-label">SIGNAL FRAGMENT <span class="sf-count">${counter}</span></p>
    <p class="sf-text">${escapeHtml(fragment)}</p>
    <p class="sf-note">${FRAGMENT_NOTE}</p>
  </td>
</tr></table>`;
  const text = `SIGNAL FRAGMENT  ${counter}\n${fragment}\n${FRAGMENT_NOTE}`;
  return { html, text };
}

// Wrap rendered body HTML in an email-client-friendly template + inline CSS.
//
// "The Frequency" chrome lives here: a mono header band carrying the transmission
// number, and (optionally) a signal-fragment block at the foot of the body. The
// reading body stays a readable serif (G6): only the chrome carries the terminal
// treatment. The footer keeps the {{unsubscribe_url}} token that sendNewsletter
// (email.js) substitutes, and its List-Unsubscribe machinery, intact.
function wrap({ subject, preheader, bodyHtml, transmission, fragment, fragmentTotal = FRAGMENT_TOTAL_DEFAULT }) {
  const hasTransmission = transmission !== undefined && transmission !== null && transmission !== '';
  const band = hasTransmission
    ? `TRANSMISSION ${pad2(transmission)} // BEING TECHNICAL WRITER`
    : 'BEING TECHNICAL WRITER';
  const fragmentBlock = signalFragment({ transmission, fragment, fragmentTotal }).html;

  const css = `
    body { margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background: #fafafa; color: #1a1a1a; line-height: 1.6; }
    .preheader { display: none; max-height: 0; overflow: hidden; }
    .tx-band { font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #5B8DEF; margin: 0 0 28px; padding-bottom: 14px; border-bottom: 2px solid #5B8DEF; }
    h1, h2, h3 { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.25; color: #0a0a0a; }
    h1 { font-size: 26px; margin: 0 0 16px; letter-spacing: -0.01em; }
    h2 { font-size: 20px; margin: 32px 0 12px; }
    h3 { font-size: 17px; margin: 24px 0 10px; }
    p { margin: 0 0 16px; font-size: 16px; }
    a { color: #5B8DEF; }
    blockquote { border-left: 3px solid #5B8DEF; margin: 20px 0; padding: 4px 0 4px 18px; color: #555; font-style: italic; }
    code { background: #f4f4f5; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; font-family: 'SF Mono', Menlo, monospace; }
    pre { background: #1a1a1a; color: #f4f4f5; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
    pre code { background: none; padding: 0; color: inherit; }
    hr { border: 0; border-top: 1px solid #eaecef; margin: 32px 0; }
    .sf-label { margin: 0 0 14px; font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #5B8DEF; }
    .sf-count { color: #5f6b7a; }
    .sf-text { margin: 0 0 14px; font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 18px; letter-spacing: 0.02em; color: #e6e9ef; }
    .sf-note { margin: 0; font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 12px; line-height: 1.6; color: #9aa4b2; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #eaecef; font-size: 12px; color: #888; text-align: center; }
  `;
  const html = `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${escapeHtml(subject)}</title>
<style>${css}</style>
</head>
<body>
<div class="preheader">${escapeHtml(preheader || '')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fafafa" style="background:#fafafa;">
<tr><td align="center" style="padding:24px;">
<table role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;">
<tr><td bgcolor="#ffffff" style="background:#ffffff;border:1px solid #eaecef;border-radius:12px;padding:40px;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;line-height:1.6;">
<p class="tx-band">${band}</p>
${bodyHtml}
${fragmentBlock}
<p class="footer">You opened this channel at <a href="https://beingtechnicalwriter.com">beingtechnicalwriter.com</a>.<br><a href="{{unsubscribe_url}}">Go dark</a> and the signal stops, every trace with it.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  return juice(html);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Simple text fallback — strip HTML, keep newlines.
function htmlToText(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Public: render a newsletter markdown source into { subject, preheader, htmlBody, textBody }.
function renderNewsletter(markdownSource) {
  const { data, body } = parseFrontMatter(markdownSource);
  if (!data.subject) throw new Error('newsletter front matter missing "subject" field');
  const bodyHtml = marked.parse(body);
  const htmlBody = wrap({
    subject: data.subject,
    preheader: data.preheader,
    bodyHtml,
    transmission: data.transmission,
    fragment: data.fragment,
    fragmentTotal: data.fragment_total,
  });
  const frag = signalFragment({
    transmission: data.transmission,
    fragment: data.fragment,
    fragmentTotal: data.fragment_total,
  });
  const textBody = `${data.preheader ? data.preheader + '\n\n' : ''}${htmlToText(bodyHtml)}${frag.text ? '\n\n' + frag.text : ''}`;
  return {
    subject: data.subject,
    preheader: data.preheader || '',
    htmlBody,
    textBody,
    frontMatter: data,
  };
}

module.exports = { renderNewsletter, parseFrontMatter };
