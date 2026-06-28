#!/usr/bin/env bash
# deploy-lambda.sh — idempotent code refresh for the SurvivalStackOptin Lambda.
#
# Usage:
#   ./bin/deploy-lambda.sh        # deploys SurvivalStackOptin
#
# What it does:
#   1. cd into backend/
#   2. npm install --omit=dev (so node_modules has just runtime deps)
#   3. zip the whole directory to /tmp/lambda.zip
#   4. aws lambda update-function-code on SurvivalStackOptin
#   5. wait for the update to settle
#
# Email + bounce/complaint handling now run through Resend (sending) and the
# POST /resend-webhook route on this same Lambda (suppression). There is no
# separate bounce Lambda, SNS topic, or SES Config Set anymore.
#
# Infrastructure (function existence, IAM role, env vars, API Gateway routes,
# S3 bucket policy) is NOT touched. Those live in AWS state. This script only
# refreshes code.

set -euo pipefail

cd "$(dirname "$0")/.."

REGION="us-east-1"
ZIP_PATH="/tmp/survival-stack-lambda.zip"

build_zip() {
  echo "→ Installing production dependencies..."
  ( cd backend && npm install --omit=dev --silent )

  echo "→ Zipping backend/ → $ZIP_PATH"
  rm -f "$ZIP_PATH"
  ( cd backend && zip -rq "$ZIP_PATH" . )
}

deploy_one() {
  local name="$1"
  echo "→ Updating Lambda code: $name"
  aws lambda update-function-code \
    --function-name "$name" \
    --zip-file "fileb://$ZIP_PATH" \
    --region "$REGION" \
    > /dev/null
  aws lambda wait function-updated \
    --function-name "$name" \
    --region "$REGION"
  echo "  ✓ $name updated"
}

build_zip
deploy_one "SurvivalStackOptin"

echo "✓ Done."
