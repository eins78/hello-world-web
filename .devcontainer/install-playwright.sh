#!/bin/bash
set -uo pipefail 

echo "Installing Playwright browsers"

npm i -g corepack && pnpm -v && \
cd /workspace/packages/ && \
pnpm install && \
cd /workspace/packages/e2e-tests/ && \
pnpm exec playwright install-deps && \
sudo -u node pnpm exec playwright install && \
echo "OK. Playwright browsers installed successfully."
