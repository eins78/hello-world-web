# AI Agent Guidelines

_Vendor-neutral instructions for AI coding assistants (GitHub Copilot, Claude, Cursor, etc.)_

## Key Rules

1. **Follow existing patterns** - Look at neighboring code before implementing
2. **Test everything** - Every feature needs unit tests AND E2E tests
3. **Document decisions** - Explain WHY, not just WHAT
4. **Keep it simple** - This is a demo project, avoid over-engineering
5. **Security first** - Even demos should follow security best practices

## Coding Standards

### TypeScript Style

- Use 2-space indentation for all files
- Use explicit return types for functions
- Use type imports with the `type` keyword
- Use `type` for object shapes and primitives
- NEVER use enums - use simple string unions instead
- Prefer const assertions for literal types
- Prefer `type` over `interface` for object types

### Naming Conventions

- **Variables, parameters, functions**: camelCase
- **Classes, interfaces, types**: PascalCase
- **Constants**: UPPER_CASE
- **Files**: kebab-case for utilities, PascalCase for components/types
- **Folders**: kebab-case

### File Organization

- One export per file when possible
- Group related functionality in directories
- Use index.ts files to re-export from directories
- Keep files focused and under 300 lines when possible
- Routes go in `/src/routes/` with subdirectories for organization
- Types go in `/src/types/` as separate files
- Unit tests are colocated as `*.test.ts` files
- E2E tests go in `/packages/e2e-tests/`
- Feature docs go in `/docs/features/`

## Commit Messages

```
feat: add calendar subscription endpoint

Implements RFC 5545 compliant iCalendar feed to test
client compatibility across different calendar apps.

Fixes #123
```

- First line: `<type>: <description>` (lowercase, ≤72 chars)
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
- Body: Explain WHY the change was made
- Reference issues with `Fixes #123` or `Relates to #123`
- Create feature branches as `feat/feature-name`
- If GPG issues: `git commit --no-gpg-sign -m "message"`

## Documentation Standards

1. Every module should include JSDoc comments for all exported functions, classes, and interfaces
2. Include parameter descriptions, return type descriptions, and examples
3. Document thrown exceptions
4. Update relevant documentation when changing functionality

## Testing Guidelines

### Unit Tests

- Test files should be colocated with source files as `*.test.ts`
- ALWAYS use Node.js built-in test runner (not Jest, Vitest, etc.)
- Focus on testing business logic and edge cases
- Use descriptive test names that explain the expected behavior

### E2E Tests

- Located in `/packages/e2e-tests/`
- Use Cypress for browser automation (or Playwright for BDD approach)
- Test user flows and integration between components
- Include visual regression tests where appropriate

#### E2E Framework Migration Guidelines

When migrating between test frameworks:
1. **Check Node.js version requirements** - Some features require specific versions
2. **Verify package versions exist** before adding to package.json
3. **Read all files before editing** - Even if you know the content
4. **Update CI/CD workflows** - Located in `.github/workflows/`
5. **Test locally first** when possible

#### BDD Testing Pattern

If using Playwright with BDD:
- Write features in Gherkin syntax in `/features/` directory
- Implement step definitions in `/steps/` directory
- Use Page Object Model in `/pages/` directory
- Use `createBdd()` pattern for importing Given/When/Then
- Generate test files with `pnpm run generate` before running tests

## Error Handling

1. Use descriptive error messages
2. Include context in error messages
3. Prefer explicit error handling over try-catch for expected errors
4. Log errors appropriately without exposing sensitive information

## Code Review Checklist

When reviewing or writing code, ensure:

- [ ] Code follows the established patterns in the codebase
- [ ] New features include appropriate tests
- [ ] Documentation is updated where necessary
- [ ] No console.log statements in production code
- [ ] Error cases are handled appropriately
- [ ] Security considerations have been addressed

## Dependencies

**ALWAYS prefer built-in Node.js modules over external packages**

When adding dependencies:
1. Justify why it's needed in the PR
2. Pin exact version (no ^ or ~)
3. Check bundle size impact
4. Verify license compatibility

Example justification:
```
Adding ical-generator@9.0.0:
- Needed for RFC 5545 compliant calendar generation
- No suitable Node.js built-in alternative
- MIT licensed, 45KB minified
```

## Demo Development Process

### When Adding New Demo Features
1. ALWAYS create feature documentation first in `/docs/features/`
2. ALWAYS implement types before implementation in `/src/types/`
3. ALWAYS add both unit tests and E2E tests
4. ALWAYS link new demos from the homepage
5. ALWAYS test with multiple browsers/clients
6. ALWAYS document vendor-specific workarounds

### Demo Requirements Checklist
- [ ] Single concept focus (one demo = one feature)
- [ ] Live interactive demo at `/demos/<feature>`
- [ ] API endpoint documented with curl examples
- [ ] Client compatibility table in docs
- [ ] Links to official specs (RFC, W3C, etc.)
- [ ] E2E tests covering happy path + edge cases
- [ ] Vendor workarounds documented with examples

## Security Considerations

- Never expose sensitive information in demos
- Use placeholder data for examples
- Validate all user inputs
- Follow OWASP guidelines for web security
- Document any intentional security simplifications for demo purposes

## Workflow Efficiency Guidelines

### Before Starting Major Changes
1. **Check environment compatibility** (Node.js version, etc.)
2. **Verify all dependencies exist** with correct versions
3. **Locate configuration files** using absolute paths
4. **Read files before editing** - always use Read tool first

### Common File Locations
- CI/CD workflows: `/workspace/.github/workflows/`
- E2E tests: `/workspace/packages/e2e-tests/`
- Documentation: `/workspace/docs/`
- Types: `/workspace/packages/app/src/types/`

### Tool Usage Best Practices
1. **Batch related operations** - Use multiple tool calls in parallel when possible
2. **Use Glob for finding files** - More efficient than multiple LS commands
3. **Check command output** - Don't assume operations succeeded
4. **Handle errors gracefully** - Have fallback plans for common issues

### File System Operations

#### Efficient Patterns
1. **Bulk File Discovery**
   ```bash
   # Good - Single glob for multiple patterns
   Glob("**/*.{test,spec}.{js,ts}")
   
   # Avoid - Multiple sequential globs
   Glob("**/*.test.js")
   Glob("**/*.test.ts")
   ```

2. **Smart File Reading**
   - Read configuration files early to understand project structure
   - Use `head_limit` parameter in `Grep` for large codebases
   - Read multiple related files in parallel when analyzing code patterns

3. **Batch Editing**
   - Group related changes together
   - Use `replace_all` parameter when renaming variables/functions
   - Plan multi-file refactoring before starting

### Test Framework Migration Pattern

1. **Initial Assessment Phase**
   - Use `Glob` to find all test files at once
   - Read package.json files to understand current dependencies
   - Check CI workflows early to understand test execution context

2. **Common Mistakes to Avoid**
   - Creating files one by one instead of batch operations
   - Incomplete initial implementation requiring multiple edits
   - Missing configuration updates (tsconfig.json, CI workflows)
   - Installing dependencies one by one instead of batch updates

3. **Systematic Approach**
   - Map old test structure to new framework
   - Create all page objects first before migrating tests
   - Update all related configuration files together
   - Test locally before pushing changes

### Monorepo-Specific Patterns

1. **Workspace Management**
   - Check workspace configuration files first (pnpm-workspace.yaml, etc.)
   - Understand package interdependencies
   - Use workspace-aware commands (`pnpm -w`, `pnpm -F <package>`)

2. **Dependency Installation**
   - Use correct package manager workspace commands
   - Install at appropriate level (workspace root vs package)
   - Verify lockfile updates after changes

### CI/CD Best Practices

1. **Proactive Checks**
   - Always check existing CI workflows before making changes
   - Verify workspace configurations (monorepo setup, package managers)
   - Test locally mimicking CI environment when possible

2. **Common CI Issues**
   - Missing working directory specifications
   - Incorrect dependency installation commands for monorepos
   - Browser installation requirements for E2E tests
   - Node.js version mismatches