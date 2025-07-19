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

4. **Once CI is green, squash only CI fix commits**:
   ```bash
   # Count your CI fix commits (e.g., if you made 3 commits to fix CI after your feature)
   git reset --soft HEAD~3  # Reset only the CI fix commits
   
   # Amend the original feature commit with the CI fixes
   git commit --amend --no-edit
   
   # Force push the updated commit
   git push --force-with-lease
   ```

5. **Example squash workflow**:
   ```bash
   # After multiple CI fixes, your history might look like:
   # - Fix lint errors             (CI fix - squash this)
   # - Fix TypeScript errors       (CI fix - squash this)  
   # - Update test snapshots       (CI fix - squash this)
   # - Initial feature implementation  (KEEP this as separate commit)
   
   # Squash only the CI fixes into the feature commit:
   git reset --soft HEAD~3  # Reset the 3 CI fix commits
   git commit --amend --no-edit  # Amend original feature commit
   # Result: Clean feature commit with all CI fixes incorporated
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

#### When to Squash vs Preserve Commits

**PRESERVE separate commits for:**
- Logical feature development steps (e.g., "add API endpoint", "add UI", "add tests")
- Different functional areas or concerns
- Commits that tell a meaningful development story
- Refactoring vs new features

**SQUASH together:**
- CI fix commits (lint errors, formatting, unused imports, etc.)
- Typo fixes and minor corrections
- Multiple attempts at the same change
- "fix tests" commits that should have been part of the original test commit

**Example of good commit history:**
```
feat: add user authentication API
feat: add login UI components  
test: add authentication E2E tests
docs: add authentication guide
```

**Example of commits to squash:**
```
feat: add user authentication API
fix: resolve ESLint errors
fix: add missing imports
fix: resolve TypeScript errors
```
↓ Should become:
```
feat: add user authentication API
```

#### Standard PR Workflow
1. Create feature branch from main
2. Implement the feature/fix with logical commits
3. Push and check CI status
4. Fix any CI failures (multiple commits OK)
5. Once CI is green, squash only the CI fix commits (keep feature commits separate)
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

# CI is finally green! Time to squash ONLY the CI fix commits
git log --oneline  # Shows 4 commits total: 1 feature + 3 CI fixes

# Squash only the 3 CI fix commits (keep the original feature commit)
git reset --soft HEAD~3  # Reset only the CI fix commits

# Commit the fixes as amendments to the original feature
git commit --amend --no-edit  # Amend the original commit with CI fixes

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
