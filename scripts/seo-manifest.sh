#!/usr/bin/env bash
# Build the combined SEO manifest: authoritative URL->source map + in-body link graph,
# across BOTH sites that share the beingtechnicalwriter.com GSC property:
#   - the blog (this repo, posts in _posts/, body in main.article-body)
#   - the API-docs course (apidocumentation repo, lessons in _docs/, body in article.prose,
#     served under the /apidocumentation baseurl)
#
# Each Jekyll site emits a base manifest; seo-mcp enriches each from its built _site HTML
# and merges them. Output: state/seo-manifest.json (read by the SEO workflow skills).

set -euo pipefail

BLOG="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SEO_MCP="${SEO_MCP_DIR:-/Users/gauravtrivedi/Documents/live_projects/seo-mcp}"
COURSE="${APIDOC_DIR:-/Users/gauravtrivedi/Documents/live_projects/apidocumentation}"
SITE_URL="${SITE_URL:-https://beingtechnicalwriter.com}"
PY="$SEO_MCP/.venv/bin/python"
export PYTHONPATH="$SEO_MCP"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# 1. Blog
( cd "$BLOG" && bundle exec jekyll build )
"$PY" -m seo_mcp.manifest build \
  --site "$BLOG/_site" --base "$BLOG/_site/seo-manifest.json" \
  --site-url "$SITE_URL" --source-root "$BLOG" --out "$TMP/blog.json"
MANIFESTS=("$TMP/blog.json")

# 2. API-docs course (optional — only if the repo is present)
if [ -d "$COURSE" ]; then
  ( cd "$COURSE" && bundle exec jekyll build )
  "$PY" -m seo_mcp.manifest build \
    --site "$COURSE/_site" --base "$COURSE/_site/seo-manifest.json" \
    --site-url "$SITE_URL" --scope-tag article --scope-class "prose,article-content" \
    --strip-prefix /apidocumentation --source-root "$COURSE" --out "$TMP/course.json"
  MANIFESTS+=("$TMP/course.json")
fi

# 3. Merge -> the manifest the workflows read
"$PY" -m seo_mcp.manifest merge --out "$BLOG/state/seo-manifest.json" "${MANIFESTS[@]}"
