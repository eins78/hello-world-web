#!/bin/bash
# Run Docker e2e tests using act
# This simulates the docker-e2e-tests.yml workflow locally
# Usage: ./scripts/run-workflow-docker-e2e.sh

set -eu

echo "Running Docker e2e tests..."
echo ""
echo "Note: This requires Docker-in-Docker support."
echo "The workflow will build a Docker image and run tests against it."
echo ""

# Run act with Docker socket passed through for Docker-in-Docker support
# Use workflow_dispatch event type and --reuse to speed up subsequent runs
act workflow_dispatch \
  -W .github/workflows/docker-e2e-tests.yml \
  -j docker-e2e \
  --container-options "--privileged -v /var/run/docker.sock:/var/run/docker.sock" \
  --reuse
