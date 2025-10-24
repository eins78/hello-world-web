# CI Troubleshooting Guide

This guide provides solutions for common CI failures in the hello-world-web project.

## Pre-Push Verification

Always verify CI will pass before pushing:

```bash
# Full CI check
pnpm run ci

# Individual checks if needed
pnpm run lint
pnpm run build
pnpm run e2e
```

This runs: clean → build & lint → e2e tests

## Common CI Failures and Fixes

### 1. Node Version Issues
- **Problem**: Experimental TypeScript flags not supported
- **Fix**: Ensure Node 22.7.0+ is used, or use `tsx` for older versions

### 2. Browser Dependencies
- **Problem**: Playwright browser launch failures
- **Fix**: In CI, all browsers are installed. Locally, install with:
  ```bash
  pnpm exec playwright install chromium
  pnpm exec playwright install firefox
  pnpm exec playwright install webkit
  ```

### 3. BDD Generation Errors
- **Problem**: Step definitions not found
- **Fix**:
  - Ensure all Gherkin steps have matching step definitions
  - Run `pnpm run generate` before tests
  - Check for duplicate step definitions

### 4. Lint Failures
- **Problem**: Code style or unused code issues
- **Fix**:
  ```bash
  # Auto-fix formatting
  pnpm run lint:eslint -- --fix

  # Check for unused exports
  pnpm run lint:knip
  ```

### 5. Unused Dependencies
- **Problem**: `tsx` or other dependencies marked as unused by lint
- **Fix**: Remove from package.json if truly unused
  ```bash
  # Remove from packages/app/package.json if not needed
  pnpm remove tsx
  ```

### 6. Unused Exports (Knip Issues)
- **Problem**: Functions appear unused but are actually imported
- **Root Cause**: Knip doesn't detect usage if entry points aren't configured
- **Fix**: Add directories to knip.json entry points
  ```json
  {
    "packages/e2e-tests": {
      "entry": [
        "playwright.config.ts",
        "steps/**/*.ts",
        "pages/**/*.ts",
        "utils/**/*.ts"  // Add this to detect utility function usage
      ]
    }
  }
  ```

## Diagnostic Commands

```bash
# Clean all build artifacts
pnpm run clean

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Debug E2E tests
cd packages/e2e-tests
pnpm test --debug
pnpm test --ui  # Opens Playwright UI

# Check what CI will run (requires act tool)
act

# View specific CI run logs
gh run view {run-id} --log-failed

# List recent workflow runs
gh run list --limit 10
```

## CI Fix Workflow

1. **Run CI locally** to catch issues early:
   ```bash
   pnpm run ci
   ```

2. **Fix any CI failures** immediately:
   - Commit fixes as needed (multiple commits are fine during this phase)
   - Keep pushing fixes until all CI checks are green
   - Common issues:
     - ESLint formatting (auto-fixable with `pnpm run lint:eslint -- --fix`)
     - Unused exports (check with Knip)
     - TypeScript errors
     - Test failures

3. **Once CI is green**: Follow the [Git Workflow Guide](git-workflow-guide.md) to squash commits

## Environment Requirements

- **Node.js**: 22.7.0+ (for experimental TypeScript support)
- **pnpm**: Latest stable version
- **OS**: Linux/macOS/Windows (CI runs on Ubuntu)
- **Browsers**: Chromium (minimum for CI)
