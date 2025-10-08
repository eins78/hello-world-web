#!/bin/bash
# Run e2e tests for a single browser using act
# Usage: ./scripts/run-workflow-e2e-browser.sh chromium|firefox|webkit

set -eu

BROWSER=${1:-chromium}

if [[ ! "$BROWSER" =~ ^(chromium|firefox|webkit)$ ]]; then
  echo "Error: Invalid browser. Use chromium, firefox, or webkit"
  exit 1
fi

echo "Running e2e tests for $BROWSER..."
act -W .github/workflows/e2e-tests.yml -j test --matrix browser:"$BROWSER" --reuse
