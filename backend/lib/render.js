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

// Wrap rendered body HTML in an email-client-friendly template + inline CSS.
function wrap({ subject, preheader, bodyHtml }) {
  const css = `
    body { margin: 0; padding: 24px; font-family: Georgia, 'Times New Roman', serif; background: #fafafa; color: #1a1a1a; line-height: 1.6; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #eaecef; border-radius: 12px; padding: 40px; }
    .preheader { display: none; max-height: 0; overflow: hidden; }
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
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #eaecef; font-size: 12px; color: #888; text-align: center; }
  `;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(subject)}</title>
<style>${css}</style>
</head>
<body>
<div class="preheader">${escapeHtml(preheader || '')}</div>
<div class="container">
${bodyHtml}
<p class="footer">You are receiving this because you opted in at <a href="https://beingtechnicalwriter.com">beingtechnicalwriter.com</a>.<br><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
</div>
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
  const htmlBody = wrap({ subject: data.subject, preheader: data.preheader, bodyHtml });
  const textBody = `${data.preheader ? data.preheader + '\n\n' : ''}${htmlToText(bodyHtml)}`;
  return {
    subject: data.subject,
    preheader: data.preheader || '',
    htmlBody,
    textBody,
    frontMatter: data,
  };
}

module.exports = { renderNewsletter, parseFrontMatter };
