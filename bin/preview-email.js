#!/usr/bin/env node
// preview-email.js — render the email layer to local HTML files for eyeballing.
//
// No send, no AWS, no network: it calls the pure render functions directly and
// writes the results to .preview/ (gitignored). Open the printed paths in a
// browser to check the dark card, the button, the transmission band, and the
// signal-fragment block before anything ships.
//
// Usage:
//   node bin/preview-email.js
//   open .preview/dispatch-doi.html .preview/transmission.html   # macOS

const fs = require('fs');
const path = require('path');

const { renderDispatchDoi } = require('../backend/lib/email');
const { renderNewsletter } = require('../backend/lib/render');

const repoRoot = path.join(__dirname, '..');
const outDir = path.join(repoRoot, '.preview');
fs.mkdirSync(outDir, { recursive: true });

function write(name, contents) {
  const p = path.join(outDir, name);
  fs.writeFileSync(p, contents);
  return p;
}

// 1. Dispatch double-opt-in confirm email ("The Frequency"). The confirm link
//    points at the real API host but is never clicked here; this is visual only.
const doi = renderDispatchDoi({
  to: 'reader@example.com',
  source: 'dispatch',
  expiry: Math.floor(Date.now() / 1000) + 86400,
  token: 'PREVIEWTOKEN',
  dest: '/newsletters/confirmed/',
});

// 2. A sample transmission, rendered from the throwaway fixture. The live
//    {{unsubscribe_url}} token is normally filled by sendNewsletter; here we
//    swap in a placeholder so the footer link is clickable in the preview.
const fixture = path.join(repoRoot, '_newsletters', '_sample-transmission.md');
const tx = renderNewsletter(fs.readFileSync(fixture, 'utf8'));
const txHtml = tx.htmlBody.replaceAll('{{unsubscribe_url}}', '#preview-unsubscribe');

const written = [
  write('dispatch-doi.html', doi.html),
  write('dispatch-doi.txt', doi.text),
  write('transmission.html', txHtml),
  write('transmission.txt', tx.textBody),
];

console.log('Email previews written:');
for (const p of written) console.log('  ' + path.relative(repoRoot, p));
console.log('\nOpen the .html files in a browser to review.');
