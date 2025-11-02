# Development Guidelines

This document outlines code quality standards and best practices for the hello-world-web project.

## Package Management Security

**NEVER use `npx` with remote packages** - This can execute arbitrary code from the internet.

Always install packages as dependencies first, then use `pnpm exec`:

```bash
# BAD - downloads and executes remote code
npx some-package

# GOOD - install first, then execute
pnpm add -D some-package
pnpm exec some-package
```

## E2E Test Development

### Core Principles

- Follow [Gherkin best practices](../packages/e2e-tests/GHERKIN_RULES.md)
- Write business-readable scenarios
- Use Page Object Model for maintainability
- Avoid shared state between tests

### Avoiding Shared State in Tests

**Never use module-level variables** to store test data. Use test context or page properties to isolate state between tests.

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

## Dependency Management

- Run `pnpm install` after any package.json changes
- Commit pnpm-lock.yaml changes
- Test thoroughly after major updates
- Keep TypeScript versions aligned across all workspace packages
- Run `pnpm run lint:knip` regularly to detect unused dependencies

See [Performance Optimization](./performance-optimization.md) for details on dependency cleanup and optimization strategies.

## TypeScript Configuration

- **Never include generated files** in `tsconfig.json`
- Only include source TypeScript files: `"include": ["**/*.ts"]`
- Generated files like `*.feature.spec.js` should never be in the TypeScript compilation
- Keep strict mode enabled
- Use proper type annotations

## Generated Files and Version Control

**Never commit generated files** to version control.

### Files to Exclude:

- `.features-gen/` directory (playwright-bdd generated specs)
- `test-results/` directory (test artifacts)
- `playwright-report/` directory (test reports)

### Removing Previously Committed Generated Files:

```bash
git rm --cached packages/e2e-tests/.features-gen/**
git rm --cached packages/e2e-tests/test-results/**
git commit -m "chore: remove generated files from version control"
```

### Ensure .gitignore includes:

```gitignore
packages/e2e-tests/test-results/
packages/e2e-tests/playwright-report/
packages/e2e-tests/.features-gen/
```

## Code Quality and Maintainability

### Extract Reusable Logic

Move validation and business logic to utility functions. Don't duplicate complex logic in step definitions.

```typescript
// utils/validation.ts
export function isValidSemver(version: string): boolean {
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)/;
  return semverRegex.test(version);
}

// Use in steps
expect(isValidSemver(json.version)).toBe(true);
```

### Handle Null/Undefined Safely

In test code, using non-null assertions (`!`) is acceptable when:
- The test would fail anyway if the value is null
- You're testing happy paths
- Example: `parseInt(text!, 10)` in test assertions

For production code, always validate properly.

### TypeScript Best Practices

**Always use proper types instead of `any`:**

```typescript
// BAD
function getTestData(page: any): TestData { ... }

// GOOD
import { Page } from "@playwright/test";
function getTestData(page: Page & { testData?: TestData }): TestData { ... }
```

**Import proper types from playwright-bdd:**

```typescript
// BAD - custom interface
async ({ page }, dataTable: { hashes: () => { property: string }[] }) => {

// GOOD - proper type
import { DataTable } from "playwright-bdd";
async ({ page }, dataTable: DataTable) => {
  const data = dataTable.hashes(); // Proper typing and intellisense
}
```

### Validation Function Design

Chain validation functions properly:

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

### Code Style Consistency

- Use consistent quote styles within files
- Prefer double quotes for consistency with project style

```typescript
env: {
  DEBUG: "hello-world-web:*",  // Consistent double quotes
  NODE_ENV: "production"
}
```

## Performance Considerations

When adding or modifying code, consider performance impact:

### Build Time
- Use minification only in production builds (`NODE_ENV=production`)
- Enable source maps for both dev and production
- Leverage Docker layer caching with `pnpm fetch`

### Runtime Performance
- Add compression for text-based responses
- Set appropriate cache headers for static assets
- Implement proper error handling to prevent crashes

### Bundle Size
- Run `du -sh packages/*/lib/**/*.js` to check bundle sizes after builds
- Target < 150KB for client bundles (minified + gzipped)
- Use code splitting for large features

See [Performance Optimization](./performance-optimization.md) for comprehensive guidelines and e18e principles.

## Key Files to Understand

- `.github/workflows/`: CI/CD configuration
- `packages/e2e-tests/`: E2E test suite with Playwright-BDD
- `knip.json`: Unused code detection config
- `eslint.config.mjs`: Code style rules
- `pnpm-workspace.yaml`: Monorepo configuration
- `docs/performance-optimization.md`: Performance optimization principles and decisions
