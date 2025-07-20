# Claude Code Assistant Instructions

This document provides guidance for AI assistants working with this codebase, particularly around CI/CD workflows and best practices.

## 🚨 GOLDEN RULE: All Checks Must Pass LOCALLY Before Pushing

**Never push code that you know will fail CI. Fix everything locally first.**

## 📋 MANDATORY WORKFLOW: Local Quality → Local CI → Push → GitHub CI

### Phase 1: Fix Code Quality Issues Locally

```bash
# Step 1: Auto-fix what can be fixed
pnpm run fix

# Step 2: Check what remains
pnpm run lint

# Step 3: Manually fix remaining issues
# Keep running pnpm run lint until it shows 0 errors/warnings
```

### Phase 2: Run Full CI Locally (BEFORE committing)

```bash
# This runs the EXACT same checks as GitHub CI:
pnpm run ci

# What this does:
# 1. clean → Removes all build artifacts
# 2. build → TypeScript compilation + all packages
# 3. lint → ESLint + Knip (in parallel with build)  
# 4. e2e → Full E2E test suite
```

**If `pnpm run ci` fails locally → DO NOT COMMIT**

### Phase 3: Commit and Push (ONLY after local CI passes)

```bash
# Now you can safely commit and push
git add .
git commit -m "feat: your feature"
git push
```

### Phase 4: GitHub CI Verification

GitHub CI should now pass on first try because you already verified locally.

## ⚡ Quick Commands Reference

**During Development (granular checks):**
```bash
pnpm run lint:eslint    # Just ESLint
pnpm run lint:knip      # Just unused exports
pnpm run build          # Just TypeScript/build
pnpm run e2e            # Just E2E tests
```

**Before Committing (full check):**
```bash
pnpm run fix            # Auto-fix issues
pnpm run ci             # Full CI verification
```

## ❌ TASK COMPLETION CRITERIA

A task is ONLY complete when:
1. ✅ `pnpm run fix` has been run
2. ✅ `pnpm run lint` shows 0 errors/warnings  
3. ✅ `pnpm run ci` passes locally
4. ✅ Code is committed and pushed
5. ✅ GitHub CI is green

**No exceptions. Ever.**

## 🚀 Common Linting Issues & Quick Fixes

### ESLint Issues
```bash
# Issue: Formatting errors
pnpm run lint:eslint -- --fix    # Auto-fixes most formatting

# Issue: Unused variables (no-unused-vars)
# Fix: Remove variable OR prefix with underscore: _unusedVar

# Issue: Missing file extensions in imports
# Fix: Add .ts/.js extension: import { foo } from "./bar.ts"
```

### Knip Issues (Unused Exports)
```bash
# Issue: Function appears unused but is imported elsewhere
# Fix: Add directory to knip.json entry points:
{
  "packages/e2e-tests": {
    "entry": [..., "utils/**/*.ts"]  // Add this
  }
}
```

### TypeScript Issues
```bash
# Issue: Type errors
npx tsc --noEmit    # Check TypeScript without building

# Issue: Strict null checks
# Fix: Use optional chaining (?.) or non-null assertion (!)
```

### Prettier Issues
```bash
# Issue: Quote style, spacing, line endings
pnpm run fix    # Usually fixes all Prettier issues automatically
```

## 🔍 Understanding CI Scripts

### Local CI (`pnpm run ci`)
Mirrors GitHub Actions exactly:
```bash
ci: "run-s clean ci:build-and-lint ci:e2e"
# Breakdown:
# - clean: Remove all build artifacts
# - ci:build-and-lint: Parallel build + lint
# - ci:e2e: Full E2E test suite
```

### GitHub Actions (automatic on push)
Two workflows that run the same checks:

**1. Build and Lint (`ci.yml`)**
- Runs: `pnpm run lint` + `pnpm run build`
- Trigger: Every push and PR

**2. E2E Tests (`e2e-tests.yml`)**  
- Runs: `pnpm run generate` + `pnpm run e2e`
- Includes: Playwright browser setup
- Trigger: Every push and PR

**Key Point:** These should NEVER fail if you ran `pnpm run ci` locally first.

## 🛠️ Troubleshooting Common Issues

### Node Version
```bash
# Problem: Experimental TypeScript flags not supported
# Fix: Ensure Node 22.7.0+ is used
node --version  # Should be 22.7.0+
```

### Playwright Browsers
```bash
# Problem: Browser launch failures in tests
# Fix: Install browsers locally
npx playwright install chromium  # Minimum for CI
npx playwright install           # All browsers for full testing
```

### Build Artifacts
```bash
# Problem: Stale build artifacts causing errors  
# Fix: Clean and rebuild
pnpm run clean
pnpm run build
```

### Dependency Issues
```bash
# Problem: Module not found errors
# Fix: Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📚 Best Practices

### E2E Test Development
- Follow [Gherkin best practices](packages/e2e-tests/GHERKIN_RULES.md)
- Write business-readable scenarios
- Use Page Object Model for maintainability
- Avoid shared state between tests

**Avoiding Shared State in Tests:**
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

### Dependency Management
- Run `pnpm install` after any package.json changes
- Commit pnpm-lock.yaml changes
- Test thoroughly after major updates

### TypeScript Configuration
- **Never include generated files** in `tsconfig.json`
- Only include source TypeScript files: `"include": ["**/*.ts"]`
- Generated files like `*.feature.spec.js` should never be in the TypeScript compilation
- Keep strict mode enabled
- Use proper type annotations

### Generated Files
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

### Code Quality

**Extract Reusable Logic:**
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

**Handle Null/Undefined Safely:**
- In test code, using non-null assertions (`!`) is acceptable when:
  - The test would fail anyway if the value is null
  - You're testing happy paths
  - Example: `parseInt(text!, 10)` in test assertions
- For production code, always validate properly

**TypeScript Best Practices:**
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

**Validation Function Design:**
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

**Code Style Consistency:**
- **Use consistent quote styles within files**
- **Prefer double quotes for consistency with project style**
  ```typescript
  env: {
    DEBUG: "hello-world-web:*",  // Consistent double quotes
    NODE_ENV: "production"
  }
  ```

## 📝 Git Workflow

### Commit Strategy

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

### Standard PR Workflow
1. Create feature branch from main
2. Implement the feature/fix with logical commits
3. Push and check CI status
4. Fix any CI failures (multiple commits OK)
5. Once CI is green, squash only the CI fix commits (keep feature commits separate)
6. Address review comments (repeat steps 3-5 as needed)

### Example: Squashing CI Fix Commits
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

### Debugging E2E Tests
```bash
# Visual debugging
cd packages/e2e-tests
pnpm test --debug      # Step through tests
pnpm test --ui         # Opens Playwright UI

# Run specific test
pnpm test ical.feature  # Just iCal tests
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

## 🚫 Git History Cleanup

### Files That Should Never Be in Git

Before committing, always check for these types of inappropriate files:

#### 1. Package Manager Files
- `.pnpm-store/` - pnpm cache directory (can be 10K+ files)
- `node_modules/` - dependency installations
- `.npm/` - npm cache

#### 2. Operating System Metadata
- `.DS_Store` - macOS Finder metadata files
- `Thumbs.db` - Windows thumbnail cache
- `desktop.ini` - Windows folder customization

#### 3. IDE and Editor Files
- `.vscode/settings.json` - Local VS Code settings
- `.idea/` - JetBrains IDE files
- `*.swp`, `*.swo` - Vim swap files

#### 4. Local Configuration
- `.claude/settings.local.json` - Local Claude Code settings
- `.env.local` - Local environment variables
- `config.local.js` - Local configuration overrides

#### 5. Build Artifacts and Generated Files
- `dist/`, `build/` - Compiled output
- `.features-gen/` - Generated test files
- `coverage/` - Test coverage reports

### Cleaning Committed Files from History

**Step 1: Identify Affected Commits**
```bash
# Check if files exist in current commit
git ls-files | grep -E '\.(DS_Store|pnpm-store)' 

# Find which commits introduced the files
git log --name-only --oneline | grep -A1 -B1 ".DS_Store"
```

**Step 2: Clean History with filter-branch**
```bash
# Remove files from entire branch history
git filter-branch -f --index-filter \
  'git rm -r --cached --ignore-unmatch .DS_Store .pnpm-store/ .claude/settings.local.json' \
  <first-commit-hash>..HEAD

# Example: Remove multiple file types
git filter-branch -f --index-filter \
  'git rm -r --cached --ignore-unmatch \
    .DS_Store docs/.DS_Store packages/.DS_Store \
    .pnpm-store/ .claude/settings.local.json' \
  f35fe8e..HEAD
```

**Step 3: Verify Cleanup**
```bash
# Check that files are gone from all commits
for commit in $(git rev-list HEAD); do
  if git ls-tree -r $commit | grep -E '\.(DS_Store|pnpm-store)'; then
    echo "Found inappropriate files in $commit"
  fi
done

# Should return no results if cleanup was successful
```

**Step 4: Force Push Cleaned History**
```bash
# Push the rewritten history
git push --force-with-lease
```

### Preventing Inappropriate Files

**Maintain Comprehensive .gitignore:**
Ensure `.gitignore` includes all inappropriate file patterns:
```gitignore
# Package managers
/.pnpm-store/
node_modules/
.npm/

# OS metadata
.DS_Store
Thumbs.db
desktop.ini

# IDE files
.vscode/settings.json
.idea/
*.swp
*.swo

# Local config
.claude/settings.local.json
.env.local
config.local.*

# Build artifacts
dist/
build/
.features-gen/
coverage/
test-results/
playwright-report/
```

**Pre-commit Checks:**
Before any commit, run:
```bash
# Check for inappropriate files
git status | grep -E '\.(DS_Store|pnpm-store)'

# Review what's being committed
git diff --cached --name-only
```

**Regular Audits:**
Periodically scan the repository:
```bash
# Find any inappropriate files that slipped through
find . -name ".DS_Store" -o -name ".pnpm-store" -o -name "Thumbs.db"

# Check git-tracked files
git ls-files | grep -E '\.(DS_Store|pnpm-store|swp|local)'
```

**When NOT to Use filter-branch:**

Use `git filter-branch` only when files are already committed to history. For uncommitted files:
- Use `git rm --cached <file>` to untrack
- Add patterns to `.gitignore`
- Use `git reset` to unstage inappropriate files

**Remember**: `git filter-branch` rewrites history and requires `--force-with-lease` push. Only use when files are already in git history and need to be completely removed from all commits.

## 💡 Quick Reference

### Key Files

- `.github/workflows/`: GitHub Actions CI/CD
- `knip.json`: Unused code detection config
- `eslint.config.mjs`: Code style rules
- `pnpm-workspace.yaml`: Monorepo configuration
- `packages/e2e-tests/`: E2E test suite
