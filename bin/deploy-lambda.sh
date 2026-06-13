#!/usr/bin/env bash
# deploy-lambda.sh — idempotent code refresh for the survival-stack Lambdas.
#
# Usage:
#   ./bin/deploy-lambda.sh                   # deploys SurvivalStackOptin (default)
#   ./bin/deploy-lambda.sh optin             # deploys SurvivalStackOptin
#   ./bin/deploy-lambda.sh bounce            # deploys SurvivalKitBounceHandler
#   ./bin/deploy-lambda.sh all               # deploys both
#
# What it does:
#   1. cd into backend/
#   2. npm install --omit=dev (so node_modules has just runtime deps)
#   3. zip the whole directory to /tmp/lambda.zip
#   4. aws lambda update-function-code on the target function(s)
#   5. wait for the update to settle
#
# Infrastructure (function existence, IAM role, env vars, API Gateway routes,
# SNS topic, SES identities, S3 bucket policy) is NOT touched. Those were set
# up once via the AWS console + CLI during the AWS-native migration and live
# in AWS state. This script only refreshes code.

set -euo pipefail

cd "$(dirname "$0")/.."

TARGET="${1:-optin}"
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

case "$TARGET" in
  optin)
    build_zip
    deploy_one "SurvivalStackOptin"
    ;;
  bounce)
    build_zip
    deploy_one "SurvivalKitBounceHandler"
    ;;
  all)
    build_zip
    deploy_one "SurvivalStackOptin"
    deploy_one "SurvivalKitBounceHandler"
    ;;
  *)
    echo "ERROR: unknown target '$TARGET' (expected: optin | bounce | all)" >&2
    exit 1
    ;;
esac

echo "✓ Done."
