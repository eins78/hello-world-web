#!/bin/bash
# Run e2e tests for all browsers using act
# Usage: ./scripts/run-workflow-e2e-all.sh

set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Running e2e tests for all browsers..."

for browser in chromium firefox webkit; do
  echo ""
  echo "=== Testing with $browser ==="
  "$SCRIPT_DIR/run-workflow-e2e-browser.sh" $browser
done

echo ""
echo "All browser tests completed!"
