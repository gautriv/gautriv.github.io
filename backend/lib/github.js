// Fetch newsletter markdown source from the public GitHub repo.
// The Lambda only needs to read; no auth headers required.

const REPO = process.env.GITHUB_REPO || 'gautriv/gautriv.github.io';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

async function fetchNewsletterSource(filepath) {
  if (!filepath || typeof filepath !== 'string') throw new Error('filepath required');
  // Reject path traversal + non-newsletter scopes.
  if (filepath.includes('..') || !filepath.startsWith('_newsletters/')) {
    throw new Error(`refusing to fetch path outside _newsletters/: ${filepath}`);
  }
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${filepath}`;
  const resp = await fetch(url, { headers: { 'User-Agent': 'SurvivalKitNewsletter/1.0' } });
  if (!resp.ok) throw new Error(`GitHub fetch failed: ${resp.status} for ${url}`);
  return resp.text();
}

module.exports = { fetchNewsletterSource };
