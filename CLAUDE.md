# Claude Code Assistant Instructions

This document provides guidance for AI assistants working with this codebase, particularly around CI/CD workflows and best practices.

## 🚨 GOLDEN RULE: CI Must Be Green

**No task is complete until all CI checks pass.** This is non-negotiable. When working on any PR:

1. Changes must pass all CI checks
2. Multiple commits to fix CI are expected and normal
3. Once CI is green, squash all fix commits into a single clean commit
4. Only after CI is green and commits are squashed is the task considered done

## CI Flow Overview

When working with pull requests in this repository, the following CI checks will run automatically:

### 1. Build and Lint (`ci.yml`)
- **Trigger**: On every push and PR to main branch
- **Node Version**: 22.x
- **Steps**:
  1. Checkout code
  2. Setup pnpm
  3. Install dependencies with frozen lockfile
  4. Run linting (`pnpm run lint`)
  5. Run build (`pnpm run build`)

### 2. E2E Tests (`e2e-tests.yml`)
- **Trigger**: On every push and PR
- **Node Version**: 22.x  
- **Environment**: Ubuntu latest
- **Steps**:
  1. Checkout code
  2. Setup pnpm
  3. Install dependencies
  4. Build lit-ssr-demo package
  5. Install Playwright Chromium browser
  6. Generate BDD test files (`pnpm run generate`)
  7. Run E2E tests (`pnpm run e2e`)

## Working with PRs

### Critical Requirements

**IMPORTANT**: A task is NOT complete until CI is green. Always ensure all CI checks pass before considering any work finished.

### CI Workflow Process

1. **Make your changes** according to the task requirements

2. **Run CI locally** to catch issues early:
   ```bash
   pnpm run ci
   ```
   This runs: clean → build & lint → e2e tests

3. **Fix any CI failures** immediately:
   - Commit fixes as needed (multiple commits are fine during this phase)
   - Keep pushing fixes until all CI checks are green
   - Common issues:
     - ESLint formatting (auto-fixable with `pnpm run lint:eslint -- --fix`)
     - Unused exports (check with Knip)
     - TypeScript errors
     - Test failures

4. **Once CI is green, squash commits**:
   ```bash
   # Count your CI fix commits (e.g., if you made 5 commits to fix CI)
   git rebase -i HEAD~5
   
   # In the interactive rebase, keep the first commit as 'pick'
   # Change all CI fix commits to 'squash' or 's'
   # Save and exit, then write a clean commit message
   
   # Force push the squashed commit
   git push --force-with-lease
   ```

5. **Example squash workflow**:
   ```bash
   # After multiple CI fixes, your history might look like:
   # - Fix lint errors
   # - Fix TypeScript errors  
   # - Update test snapshots
   # - Fix import paths
   # - Initial feature implementation
   
   # Squash into one clean commit:
   git rebase -i HEAD~5
   # Result: "feat: implement new feature with all CI checks passing"
   ```

### Before Pushing Changes

Always verify CI will pass:
```bash
# Full CI check
pnpm run ci

# Individual checks if needed
pnpm run lint
pnpm run build
pnpm run e2e
```

### Common CI Failures and Fixes

#### 1. Node Version Issues
- **Problem**: Experimental TypeScript flags not supported
- **Fix**: Ensure Node 22.7.0+ is used, or use `tsx` for older versions

#### 2. Browser Dependencies
- **Problem**: Playwright browser launch failures
- **Fix**: In CI, only Chromium is installed. Locally, install with:
  ```bash
  npx playwright install chromium
  ```

#### 3. BDD Generation Errors
- **Problem**: Step definitions not found
- **Fix**: 
  - Ensure all Gherkin steps have matching step definitions
  - Run `pnpm run generate` before tests
  - Check for duplicate step definitions

#### 4. Lint Failures
- **Problem**: Code style or unused code issues
- **Fix**:
  ```bash
  # Auto-fix formatting
  pnpm run lint:eslint -- --fix
  
  # Check for unused exports
  pnpm run lint:knip
  ```

## Best Practices When Making Changes

### 1. E2E Test Development
- Follow [Gherkin best practices](packages/e2e-tests/GHERKIN_RULES.md)
- Write business-readable scenarios
- Use Page Object Model for maintainability
- Avoid shared state between tests

### 2. Dependency Updates
- Run `pnpm install` after any package.json changes
- Commit pnpm-lock.yaml changes
- Test thoroughly after major updates

### 3. TypeScript Configuration
- Don't include generated files in tsconfig
- Keep strict mode enabled
- Use proper type annotations

### 4. Git Workflow

#### Standard PR Workflow
1. Create feature branch from main
2. Implement the feature/fix
3. Push and check CI status
4. Fix any CI failures (multiple commits OK)
5. Once CI is green, squash all commits
6. Address review comments (repeat steps 3-5 as needed)

#### Real Example from This Repository
```bash
# Initial work
git checkout -b playwright-bdd
git add .
git commit -m "feat: migrate e2e tests from Cypress to Playwright-BDD"
git push -u origin playwright-bdd

# CI fails - lint errors
git add .
git commit -m "fix: resolve ESLint errors"
git push

# CI fails - missing dependencies  
git add .
git commit -m "fix: add missing playwright dependencies"
git push

# CI fails - test errors
git add .
git commit -m "fix: update step definitions for BDD tests"
git push

# CI is finally green! Time to squash using soft reset
git log --oneline  # Shows 4 commits

# Soft reset to before all the CI fix commits
git reset --soft HEAD~3  # Reset 3 commits (keeping the first)

# All changes are now staged, commit with a clean message
git commit -m "feat: migrate e2e tests from Cypress to Playwright-BDD

- Replace Cypress with Playwright and playwright-bdd
- Convert tests to Gherkin format with BDD approach
- Implement Page Object Model pattern
- Update CI workflow for new test framework"

git push --force-with-lease
```

## Troubleshooting Commands

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

# Check what CI will run
act  # Requires act tool to run GitHub Actions locally
```

## Environment Requirements

- **Node.js**: 22.7.0+ (for experimental TypeScript support)
- **pnpm**: Latest stable version
- **OS**: Linux/macOS/Windows (CI runs on Ubuntu)
- **Browsers**: Chromium (minimum for CI)

## Key Files to Understand

- `.github/workflows/`: CI/CD configuration
- `packages/e2e-tests/`: E2E test suite with Playwright-BDD
- `knip.json`: Unused code detection config
- `eslint.config.mjs`: Code style rules
- `pnpm-workspace.yaml`: Monorepo configuration

## Getting Help

- Check CI logs for specific error messages
- Review recent successful PR patterns
- Consult package documentation for tools (Playwright, playwright-bdd, etc.)
- Follow existing code patterns in the repository