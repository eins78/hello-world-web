# Claude Code Assistant Instructions

This document provides guidance for AI assistants working with this codebase, particularly around CI/CD workflows and best practices.

## ⚡ QUICK RULES (Read This First)

<critical_instructions>

### Renovate PR Comments
**WHEN reviewing PRs with author = `app/renovate` OR `renovate[bot]`:**

1. **IMMEDIATELY** read [RENOVATE_PR_COMMENTS.md](docs/RENOVATE_PR_COMMENTS.md)
2. **Follow hard constraints:** Max 3 lines, max 200 chars, no boilerplate sections
3. **Default response:** `✅ CI green.` (if no issues found)
4. **Only expand if:** CI failed, breaking changes, or config mismatches detected
5. **Use template:** `[emoji] [one-line summary]`

**This overrides general verbosity guidelines for Renovate PRs.**

### CI Golden Rule
**No task is complete until all CI checks pass.** This is non-negotiable.
- Multiple commits to fix CI are normal and expected
- Once CI is green, squash all fix commits into one clean commit
- Only after CI is green AND commits are squashed is the task done

</critical_instructions>

---

**Detailed guidelines continue below.**

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

### Testing Workflows Locally with act

When modifying GitHub Actions workflows, always test them locally using `act` before pushing:

```bash
# Test e2e workflow for a specific browser
./scripts/run-workflow-e2e-browser.sh chromium

# Test e2e workflow for all browsers
./scripts/run-workflow-e2e-all.sh

# Test other workflows
act -W .github/workflows/[workflow-name].yml
```

See [Testing Workflows Locally](docs/testing-github-workflows-locally.md) for detailed instructions.

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
- **Fix**: In CI, all browsers are installed. Locally, install with:
  ```bash
  pnpm exec playwright install chromium
  pnpm exec playwright install firefox
  pnpm exec playwright install webkit
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

#### 5. Unused Dependencies
- **Problem**: `tsx` or other dependencies marked as unused by lint
- **Fix**: Remove from package.json if truly unused
  ```bash
  # Remove from packages/app/package.json if not needed
  pnpm remove tsx
  ```

#### 6. Unused Exports (Knip Issues)
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

## Best Practices When Making Changes

### 0. Package Management
- **NEVER use `npx` with remote packages** - This can execute arbitrary code from the internet
- Always install packages as dependencies first, then use `pnpm exec`
- Example:
  ```bash
  # BAD - downloads and executes remote code
  npx some-package
  
  # GOOD - install first, then execute
  pnpm add -D some-package
  pnpm exec some-package
  ```

### 1. E2E Test Development
- Follow [Gherkin best practices](packages/e2e-tests/GHERKIN_RULES.md)
- Write business-readable scenarios
- Use Page Object Model for maintainability
- Avoid shared state between tests

#### Avoiding Shared State in Tests
- **Never use module-level variables** to store test data
- Use test context or page properties to isolate state between tests
- Example of safe state management:
  ```typescript
  // BAD - causes race conditions in parallel tests
  let sharedValue: number;
  
  // GOOD - test-specific storage
  interface TestData {
    value?: number;
  }
  function getTestData(page: any): TestData {
    if (!page.testData) page.testData = {};
    return page.testData;
  }
  ```

### 2. Dependency Updates
- Run `pnpm install` after any package.json changes
- Commit pnpm-lock.yaml changes
- Test thoroughly after major updates

### 3. TypeScript Configuration
- **Never include generated files** in `tsconfig.json`
- Only include source TypeScript files: `"include": ["**/*.ts"]`
- Generated files like `*.feature.spec.js` should never be in the TypeScript compilation
- Keep strict mode enabled
- Use proper type annotations

### 4. Generated Files and Version Control
- **Never commit generated files** to version control
- Generated files to exclude:
  - `.features-gen/` directory (playwright-bdd generated specs)
  - `test-results/` directory (test artifacts)
  - `playwright-report/` directory (test reports)
- If generated files were previously committed, remove them:
  ```bash
  git rm --cached packages/e2e-tests/.features-gen/**
  git rm --cached packages/e2e-tests/test-results/**
  git commit -m "chore: remove generated files from version control"
  ```
- Ensure `.gitignore` includes these patterns:
  ```gitignore
  packages/e2e-tests/test-results/
  packages/e2e-tests/playwright-report/
  packages/e2e-tests/.features-gen/
  ```

### 5. Code Quality and Maintainability

#### Extract Reusable Logic
- Move validation and business logic to utility functions
- Don't duplicate complex logic in step definitions
- Example:
  ```typescript
  // utils/validation.ts
  export function isValidSemver(version: string): boolean {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)/;
    return semverRegex.test(version);
  }
  
  // Use in steps
  expect(isValidSemver(json.version)).toBe(true);
  ```

#### Handle Null/Undefined Safely
- In test code, using non-null assertions (`!`) is acceptable when:
  - The test would fail anyway if the value is null
  - You're testing happy paths
  - Example: `parseInt(text!, 10)` in test assertions
- For production code, always validate properly

#### TypeScript Best Practices
- **Always use proper types instead of `any`**
  ```typescript
  // BAD
  function getTestData(page: any): TestData { ... }
  
  // GOOD
  import { Page } from "@playwright/test";
  function getTestData(page: Page & { testData?: TestData }): TestData { ... }
  ```

- **Import proper types from playwright-bdd**
  ```typescript
  // BAD - custom interface
  async ({ page }, dataTable: { hashes: () => { property: string }[] }) => {
  
  // GOOD - proper type
  import { DataTable } from "playwright-bdd";
  async ({ page }, dataTable: DataTable) => {
    const data = dataTable.hashes(); // Proper typing and intellisense
  ```

#### Validation Function Design
- **Chain validation functions properly**
  ```typescript
  // BAD - incomplete validation
  export function isValidSemverWithNonZeroMajor(version: string): boolean {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
    return match && parseInt(match[1], 10) > 0;
  }
  
  // GOOD - validates format first
  export function isValidSemverWithNonZeroMajor(version: string): boolean {
    if (!isValidSemver(version)) return false;
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
    return match ? parseInt(match[1], 10) > 0 : false;
  }
  ```

#### Code Style Consistency
- **Use consistent quote styles within files**
- **Prefer double quotes for consistency with project style**
  ```typescript
  env: {
    DEBUG: "hello-world-web:*",  // Consistent double quotes
    NODE_ENV: "production"
  }
  ```

### 6. Git Workflow

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

## Renovate PR Handling

For automated Renovate dependency update PRs, see [RENOVATE_PR_COMMENTS.md](docs/RENOVATE_PR_COMMENTS.md) for concise comment guidelines.

**Workflow:**
- Process ALL updates until Dependency Dashboard is clear
- Work on ONE PR at a time due to pnpm lockfile conflicts
- Either merge (after fixing CI) or skip (escalate to @eins78)
- Never stop until all updates are handled
- **Keep PR comments SHORT** - most updates are routine (see RENOVATE_PR_COMMENTS.md)

## Getting Help

- Check CI logs for specific error messages
- Review recent successful PR patterns
- Consult package documentation for tools (Playwright, playwright-bdd, etc.)
- Follow existing code patterns in the repository
