# Claude Code Assistant Instructions

This document provides core guidance for AI assistants working with this codebase. Detailed instructions are in separate documents (see references below).

## ⚡ QUICK RULES (Read This First)

<critical_instructions>

### Renovate PR Comments
**WHEN reviewing PRs with author = `app/renovate` OR `renovate[bot]`:**

1. **IMMEDIATELY** read [RENOVATE_PR_COMMENTS.md](docs/RENOVATE_PR_COMMENTS.md)
2. **For Node.js PRs:** Check if LTS configuration needs updating
   - Read [renovate-nodejs-lts.md](docs/renovate-nodejs-lts.md)
   - Verify `allowedVersions` in `.renovaterc` matches current LTS versions
   - If Node.js has a new LTS release, update the constraint before reviewing
3. **For Grouped PRs:** (title contains "All non-major dependencies" or similar)
   - Check PR description for list of included updates
   - If CI fails, identify which package caused the failure from logs
   - See [renovate-nodejs-lts.md#debugging-grouped-prs](docs/renovate-nodejs-lts.md#debugging-grouped-prs) for strategies
4. **For CI GREEN:** Max 3 lines, max 200 chars. Default: `✅ CI green.`
5. **For CI FAILED:** Use expanded diagnostic format with error logs and fix guidance
6. **Use template:** `[emoji] [one-line summary]`

**This overrides general verbosity guidelines for Renovate PRs.**

### CI Golden Rule
**No task is complete until all CI checks pass.** This is non-negotiable.
- Multiple commits to fix CI are normal and expected
- Once CI is green, squash all fix commits into one clean commit
- Only after CI is green AND commits are squashed is the task done

### GitHub Actions Optimization
**ALWAYS run `pnpm run ci` locally before pushing.** This optimizes GitHub Actions usage and avoids wasted CI runs.

1. **Before every push:** Run `pnpm run ci` locally
2. **Fix all issues:** Address any lint, build, or test failures
3. **Only push when green:** Only push when local CI passes completely
4. **Exception:** You may push to trigger remote-only checks (Docker) after local checks pass

**Rationale:** Each push triggers multiple GitHub Actions workflows. Running CI locally first prevents wasted Actions minutes and speeds up the development cycle. Note: Local CI covers lint, build, and E2E tests; only Docker-related workflows require remote execution.

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

**IMPORTANT:** Always run `pnpm run ci` locally BEFORE pushing to avoid wasted GitHub Actions runs.

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
- **Permissions**: Read-only + comment
- **Behavior**: Follows [RENOVATE_PR_COMMENTS.md](docs/RENOVATE_PR_COMMENTS.md)
  - Checks PR state after CI completes
  - No comment if already merged (automerge enabled for minor/patch/pin/digest)
  - Brief comment (≤3 lines) when CI green and PR open
  - Expanded diagnostics when CI failed

**⚠️ CRITICAL: Collapse Previous Comments Before Posting**

When the PR has been synchronized (new push), you MUST collapse your previous comment before posting a new one:

1. **Find previous Claude comments**:
   ```bash
   gh pr view <PR_NUMBER> --json comments \
     --jq '.comments[] | select(.author.login == "claude-code-bot" or .author.login == "claude") | {id: .id, body: .body, createdAt: .createdAt}'
   ```
   This returns an array like: `[{id: 123456, body: "...", createdAt: "2025-11-30T10:00:00Z"}]`

2. **Get the MOST RECENT comment** (last in the list) and extract its numeric `id` field

3. **Check if already collapsed**: Use `echo "$body" | grep -q "<details>"` to check

4. **If NOT collapsed, wrap it in `<details>` tag**:
   ```html
   <details>
   <summary>⏳ Outdated review (superseded by new push)</summary>

   [original body]

   _Review from [createdAt]_
   </details>
   ```

5. **Update the comment** using GitHub API with the numeric comment ID:
   ```bash
   # IMPORTANT: Use the numeric 'id' field (e.g., 123456), NOT the node_id
   gh api -X PATCH /repos/OWNER/REPO/issues/comments/<NUMERIC_ID> \
     -f body="<wrapped content with proper escaping>"
   ```

   **Critical**:
   - Use the numeric `id` field from the JSON (e.g., `123456`)
   - Properly escape the body content for JSON (quotes, newlines, etc.)
   - Test the update with a simple body first if unsure about escaping

**Why this is critical:**
- Keeps PR thread clean (only latest review expanded)
- Preserves history (collapsed comments still accessible)
- Shows clear progression when PR is updated multiple times
- User requested this explicitly - it worked before, must work consistently

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
- [renovate-nodejs-lts.md](docs/renovate-nodejs-lts.md) - Node.js LTS-only configuration and maintenance

**Infrastructure:**
- [Testing Workflows Locally](docs/testing-github-workflows-locally.md) - Using `act` for workflow testing
- [Cloud Run Deployment](docs/cloud-run-deployment.md) - Production deployment guide
- [GitHub Secrets](docs/github-secrets.md) - Secret management

## Getting Help

- Check CI logs: `gh run view {run-id} --log-failed`
- Review recent successful PR patterns
- Consult package documentation (Playwright, playwright-bdd, Lit, etc.)
- Follow existing code patterns in the repository
