// Unit tests for the pure render layer of the email pipeline.
// Run with: cd backend && node --test
//
// These test the CONTRACT (shape, embedded confirm link, ASCII-only body per G5,
// plain-text mirror), not the marketing prose. The prose passes through the
// reviewing-blog-voice audit separately and may change; tests must not fight that.

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { renderDispatchDoi, confirmLink } = require('../lib/email');
const { renderNewsletter } = require('../lib/render');

const TRANSMISSION_SRC = `---
subject: Test Transmission
preheader: A field note from two issues ahead.
transmission: 1
fragment: the writer
---
First body paragraph.

Second body paragraph.
`;

const PLAIN_SRC = `---
subject: Plain Issue
preheader: No fragment here.
---
Just a body paragraph.
`;

const SAMPLE = {
  to: 'reader@example.com',
  source: 'dispatch',
  expiry: 1893456000,
  token: 'abc123tok',
  dest: '/newsletters/confirmed/',
};

test('renderDispatchDoi returns { subject, html, text } strings', () => {
  const out = renderDispatchDoi(SAMPLE);
  assert.equal(typeof out.subject, 'string');
  assert.ok(out.subject.length > 0, 'subject is non-empty');
  assert.equal(typeof out.html, 'string');
  assert.ok(out.html.length > 0, 'html is non-empty');
  assert.equal(typeof out.text, 'string');
  assert.ok(out.text.length > 0, 'text is non-empty');
});

test('renderDispatchDoi embeds the confirm link in both html and text', () => {
  const out = renderDispatchDoi(SAMPLE);
  const expected = confirmLink({
    email: SAMPLE.to,
    source: SAMPLE.source,
    expiry: SAMPLE.expiry,
    token: SAMPLE.token,
    dest: SAMPLE.dest,
  });
  assert.ok(out.html.includes(`href="${expected}"`), 'html has the confirm link as an anchor href');
  assert.ok(out.text.includes(expected), 'text mirror has the confirm link');
});

test('renderDispatchDoi body is ASCII-only (G5: no emoji, no exotic glyphs, no em dash)', () => {
  const out = renderDispatchDoi(SAMPLE);
  const nonAscii = /[^\x00-\x7F]/;
  assert.ok(!nonAscii.test(out.subject), 'subject is ASCII-only');
  assert.ok(!nonAscii.test(out.html), 'html is ASCII-only');
  assert.ok(!nonAscii.test(out.text), 'text is ASCII-only');
});

test('renderDispatchDoi text is a plain-text mirror (no HTML tags)', () => {
  const out = renderDispatchDoi(SAMPLE);
  assert.ok(!/<[a-z!/]/i.test(out.text), 'text mirror contains no HTML tags');
});

// --- World-class hardening: cross-client (Outlook) robustness ---

test('renderDispatchDoi is mobile-ready with a proper head (charset, viewport, lang, color-scheme)', () => {
  const out = renderDispatchDoi(SAMPLE);
  assert.match(out.html, /<meta[^>]+charset/i, 'declares a charset');
  assert.match(out.html, /name="viewport"/i, 'has a viewport meta for mobile scaling');
  assert.match(out.html, /<html[^>]+lang="en"/i, 'sets document language');
  assert.match(out.html, /color-scheme/i, 'hints dark/light to the client');
});

test('renderDispatchDoi uses table layout with a bgcolor card (survives Outlook)', () => {
  const out = renderDispatchDoi(SAMPLE);
  assert.match(out.html, /role="presentation"/i, 'layout uses presentation tables');
  assert.ok(out.html.includes('bgcolor="#0A0A0B"'), 'dark card carries a bgcolor attribute, not only CSS background');
});

test('renderNewsletter fragment box carries a bgcolor so the reward survives Outlook', () => {
  const out = renderNewsletter(TRANSMISSION_SRC);
  assert.ok(out.htmlBody.includes('bgcolor="#0A0A0B"'), 'fragment box uses a bgcolor attribute');
});

// --- Phase 2: transmission chrome + signal fragment (G7 front-matter threading) ---

test('renderNewsletter threads transmission into the header band', () => {
  const out = renderNewsletter(TRANSMISSION_SRC);
  assert.ok(out.htmlBody.includes('TRANSMISSION 01'), 'header band shows zero-padded transmission number');
  assert.ok(out.htmlBody.includes('BEING TECHNICAL WRITER'), 'header band carries the brand');
});

test('renderNewsletter renders the signal fragment block when fragment is set', () => {
  const out = renderNewsletter(TRANSMISSION_SRC);
  assert.ok(out.htmlBody.includes('SIGNAL FRAGMENT'), 'fragment block label present');
  assert.ok(out.htmlBody.includes('01 / 06'), 'fragment counter present');
  assert.ok(out.htmlBody.includes('the writer'), 'fragment text present');
  assert.ok(out.textBody.includes('the writer'), 'fragment survives into the text mirror');
});

test('renderNewsletter omits the fragment block when fragment is absent', () => {
  const out = renderNewsletter(PLAIN_SRC);
  assert.ok(!out.htmlBody.includes('SIGNAL FRAGMENT'), 'no fragment block without a fragment');
});

test('renderNewsletter keeps the {{unsubscribe_url}} token for the send layer', () => {
  const out = renderNewsletter(TRANSMISSION_SRC);
  assert.ok(out.htmlBody.includes('{{unsubscribe_url}}'), 'unsubscribe token preserved for sendNewsletter');
});

test('renderNewsletter body and chrome stay ASCII-only (G5)', () => {
  const out = renderNewsletter(TRANSMISSION_SRC);
  const nonAscii = /[^\x00-\x7F]/;
  assert.ok(!nonAscii.test(out.htmlBody), 'html is ASCII-only');
});
