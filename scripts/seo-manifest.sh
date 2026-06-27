#!/usr/bin/env bash
# Build the enriched SEO manifest: authoritative URL->source-file map + in-body link graph.
#
# Step 1: Jekyll emits the base manifest (url, path, title, description, date, word_count, ...).
# Step 2: seo-mcp enriches each post with headings + internal/outbound links parsed from the
#         rendered article body (main.article-body), excluding nav/footer/related-posts chrome.
#
# Output: state/seo-manifest.json  (read by the SEO workflow skills)

set -euo pipefail

BLOG="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SEO_MCP="${SEO_MCP_DIR:-/Users/gauravtrivedi/Documents/live_projects/seo-mcp}"
SITE_URL="${SITE_URL:-https://beingtechnicalwriter.com}"
PY="$SEO_MCP/.venv/bin/python"

cd "$BLOG"
bundle exec jekyll build

PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.manifest build \
  --site "$BLOG/_site" \
  --base "$BLOG/_site/seo-manifest.json" \
  --site-url "$SITE_URL" \
  --out "$BLOG/state/seo-manifest.json"
