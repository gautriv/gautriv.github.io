#!/usr/bin/env bash
# send-newsletter.sh — trigger a newsletter send via the protected Lambda endpoint.
#
# Usage:
#   ./bin/send-newsletter.sh _newsletters/2026-06-01-edition.md
#   ./bin/send-newsletter.sh _newsletters/2026-06-01-edition.md --test=trivedi.gaurav30@gmail.com
#
# Requires:
#   - awscurl (install once: `pip install awscurl` or `pipx install awscurl`)
#   - Your AWS credentials configured (~/.aws/credentials or env vars)
#
# The Lambda's /send-newsletter route is protected by API Gateway AWS_IAM auth.
# awscurl signs the request with your AWS credentials (SigV4) — only your IAM
# identity can invoke this endpoint. No shared webhook secret to leak.

set -euo pipefail

ENDPOINT="https://sbzzbnh7me.execute-api.us-east-1.amazonaws.com/send-newsletter"
REGION="us-east-1"

if [ $# -lt 1 ]; then
  cat >&2 <<USAGE
Usage: $0 <filepath> [--test=email@example.com]

Examples:
  $0 _newsletters/2026-06-01-edition.md
  $0 _newsletters/2026-06-01-edition.md --test=trivedi.gaurav30@gmail.com

Notes:
  - <filepath> is repo-relative (must start with '_newsletters/'); the Lambda fetches
    the file from GitHub's raw content URL on the 'main' branch.
  - --test=<addr> sends to ONE address only and skips the audience entirely.
USAGE
  exit 1
fi

FILEPATH="$1"
TEST_FLAG="${2:-}"

if ! command -v awscurl >/dev/null 2>&1; then
  echo "ERROR: awscurl not found. Install with: pip install awscurl" >&2
  exit 1
fi

# Build the JSON payload.
if [[ "$TEST_FLAG" == --test=* ]]; then
  TEST_EMAIL="${TEST_FLAG#--test=}"
  PAYLOAD=$(printf '{"filepath":"%s","test":"%s"}' "$FILEPATH" "$TEST_EMAIL")
  echo "→ TEST send to: $TEST_EMAIL"
elif [ -z "$TEST_FLAG" ]; then
  PAYLOAD=$(printf '{"filepath":"%s"}' "$FILEPATH")
  echo "→ LIVE send to all active subscribers"
  echo "  Filepath: $FILEPATH"
  read -rp "Type 'send' to confirm (anything else aborts): " CONFIRM
  if [ "$CONFIRM" != "send" ]; then
    echo "Aborted."
    exit 1
  fi
else
  echo "ERROR: unrecognized flag: $TEST_FLAG" >&2
  exit 1
fi

echo "→ Posting to $ENDPOINT"
awscurl --service execute-api --region "$REGION" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$ENDPOINT"
echo ""
