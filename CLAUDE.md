# Claude Code Assistant Instructions

This document provides core guidance for AI assistants working with this codebase. Detailed instructions are in separate documents (see references below).

## ⚡ QUICK RULES (Read This First)

<critical_instructions>

### Renovate PR Comments
**WHEN reviewing PRs with author = `app/renovate` OR `renovate[bot]`:**

1. **IMMEDIATELY** read [RENOVATE_PR_COMMENTS.md](docs/RENOVATE_PR_COMMENTS.md)
2. **For CI GREEN:** Max 3 lines, max 200 chars. Default: `✅ CI green.`
3. **For CI FAILED:** Use expanded diagnostic format with error logs and fix guidance
4. **Use template:** `[emoji] [one-line summary]`

**This overrides general verbosity guidelines for Renovate PRs.**

### CI Golden Rule
**No task is complete until all CI checks pass.** This is non-negotiable.
- Multiple commits to fix CI are normal and expected
- Once CI is green, squash all fix commits into one clean commit
- Only after CI is green AND commits are squashed is the task done

### Package Management Security
**NEVER use `npx` with remote packages** - This can execute arbitrary code from the internet.
Always install packages as dependencies first, then use `pnpm exec`.

```bash
# BAD - downloads and executes remote code
npx some-package

# GOOD - install first, then execute
pnpm add -D some-package
pnpm exec some-package
```

</critical_instructions>

---

## CI Flow Overview

### Main CI Checks

1. **Build and Lint** (`test.yml`)
   - Node 22.x, pnpm
   - Runs: `pnpm run lint` → `pnpm run build`

2. **E2E Tests** (`e2e-tests.yml`)
   - Playwright BDD tests in Chromium
   - Generates test files then runs: `pnpm run e2e`

3. **Docker E2E Tests** (`docker-e2e-tests.yml`)
   - Tests SSR in production-like environment

### Quick CI Check Commands

```bash
# Full CI check locally
pnpm run ci

# Individual checks
pnpm run lint
pnpm run build
pnpm run e2e

# Run E2E tests without hanging on report server (useful for debugging)
CI=true pnpm run e2e
```

## Claude Code Automation Workflows

This repository uses three automated workflows:

### 1. claude-code-review.yml - Human PR Auto-Review
- **Trigger**: PRs from humans (excludes Renovate)
- **Permissions**: Read-only + comment
- **Behavior**: Comprehensive code review after CI completes (waits up to 30 min)

### 2. claude-renovate-review.yml - Renovate PR Review
- **Trigger**: PRs from `app/renovate` or `renovate[bot]`
- **Timing**: Waits for CI (up to 30 min), then checks if PR still open
- **Automerge Aware**: Exits gracefully if PR already merged (common for patch/minor)
- **Repeated Pushes**: Collapses previous comments before posting new review
- **Permissions**: Read-only + comment
- **Behavior**: Follows [RENOVATE_PR_COMMENTS.md](docs/RENOVATE_PR_COMMENTS.md)
  - Checks PR state after CI completes
  - No comment if already merged (automerge enabled for minor/patch/pin/digest)
  - Collapses outdated comments on synchronized PRs (keeps thread clean)
  - Brief comment (≤3 lines) when CI green and PR open
  - Expanded diagnostics when CI failed

### 3. claude-write.yml - Interactive @claude Mentions
- **Trigger**: Comments/reviews with `@claude` mention
- **Permissions**: ⚠️ **WRITE ACCESS** - Can push commits
- **Behavior**: Executes user's instruction from comment

**Security Model:** Write permissions only for explicit user actions. All workflows use SHA pinning for supply-chain security.

## Working with PRs

### CRITICAL: CI Workflow Process

**MUST follow the complete PR workflow in [Git Workflow Guide](docs/git-workflow-guide.md).**

Key steps:
1. Make changes
2. Run CI locally: `pnpm run ci`
3. Fix failures (multiple commits OK)
4. Once CI green, squash all commits
5. Only then is the task complete

### Addressing PR Review Comments

**PRs are blocked until ALL relevant review comments are addressed AND resolved.**

Follow the complete workflow in [Git Workflow Guide](docs/git-workflow-guide.md#addressing-pr-review-comments):
1. Address feedback with code changes
2. Reply to each comment with fix details
3. Resolve threads using GraphQL API
4. For out-of-scope comments, reply explaining why and ask reviewer to resolve

### When CI Fails

See [CI Troubleshooting Guide](docs/ci-troubleshooting.md) for common failures and fixes.

Quick fix: `pnpm run lint:eslint -- --fix`

### Testing Workflows

See [Testing Workflows Locally](docs/testing-github-workflows-locally.md) for using `act` to test GitHub Actions.

## Development Guidelines

**MUST follow [Development Guidelines](docs/development-guidelines.md)** for all code changes (E2E tests, TypeScript, version control, code quality).

## Documentation Index

**Core Workflows:**
- [Git Workflow Guide](docs/git-workflow-guide.md) - PR process, commit squashing, real examples
- [CI Troubleshooting](docs/ci-troubleshooting.md) - Common failures and fixes
- [Development Guidelines](docs/development-guidelines.md) - Code quality standards

**Renovate PRs:**
- [RENOVATE_PR_COMMENTS.md](docs/RENOVATE_PR_COMMENTS.md) - Comment format guidelines

**Infrastructure:**
- [Testing Workflows Locally](docs/testing-github-workflows-locally.md) - Using `act` for workflow testing
- [Cloud Run Deployment](docs/cloud-run-deployment.md) - Production deployment guide
- [GitHub Secrets](docs/github-secrets.md) - Secret management

## Getting Help

- Check CI logs: `gh run view {run-id} --log-failed`
- Review recent successful PR patterns
- Consult package documentation (Playwright, playwright-bdd, Lit, etc.)
- Follow existing code patterns in the repository
