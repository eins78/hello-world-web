# Git Workflow Guide

This guide explains the Git workflow and PR management process for the hello-world-web project.

## Standard PR Workflow

1. Create feature branch from main
2. Implement the feature/fix
3. Push and check CI status
4. Fix any CI failures (multiple commits OK)
5. Once CI is green, squash all commits
6. Address review comments (repeat steps 3-5 as needed)

## CI Workflow Process

### 1. Make Your Changes

Implement changes according to task requirements.

### 2. Run CI Locally

Catch issues early before pushing:

```bash
pnpm run ci
```

This runs: clean → build & lint → e2e tests

### 3. Fix CI Failures

Commit fixes as needed (multiple commits are fine during this phase):

- Keep pushing fixes until all CI checks are green
- Use [CI Troubleshooting Guide](ci-troubleshooting.md) for common issues
- Common problems:
  - ESLint formatting (auto-fixable with `pnpm run lint:eslint -- --fix`)
  - Unused exports (check with Knip)
  - TypeScript errors
  - Test failures

### 4. Squash Commits Once CI is Green

Count your CI fix commits and squash them into a single clean commit:

```bash
# Count your CI fix commits (e.g., if you made 5 commits to fix CI)
git rebase -i HEAD~5

# In the interactive rebase, keep the first commit as 'pick'
# Change all CI fix commits to 'squash' or 's'
# Save and exit, then write a clean commit message

# Force push the squashed commit
git push --force-with-lease
```

### 5. Example Squash Workflow

After multiple CI fixes, your history might look like:

```
- Fix lint errors
- Fix TypeScript errors
- Update test snapshots
- Fix import paths
- Initial feature implementation
```

Squash into one clean commit:

```bash
git rebase -i HEAD~5
# Result: "feat: implement new feature with all CI checks passing"
```

## Real-World Example

Here's an actual workflow from this repository:

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

## Addressing PR Review Comments

**CRITICAL: PRs are blocked until ALL relevant review comments are addressed AND resolved.**

When copilot or human reviewers leave comments on a PR, follow this workflow:

### 1. Address the Feedback

Make code changes to fix the issues raised in the comments.

### 2. Reply to Each Comment

After pushing your fixes, reply to each comment explaining what was fixed and reference the commit:

```bash
# Reply to a specific comment
gh api -X POST repos/eins78/hello-world-web/pulls/{pr_number}/comments/{comment_id}/replies \
  -f body="✅ Fixed in {commit_sha} - {description of fix}"
```

Example: `✅ Fixed in 74c2950b - Changed to env.BASE_PATH ?? "" for consistency with other fields.`

### 3. Resolve the Thread

Use GitHub GraphQL API to mark threads as resolved:

```bash
# First, get all unresolved threads
gh api graphql -f query='
query {
  repository(owner: "eins78", name: "hello-world-web") {
    pullRequest(number: {pr_number}) {
      reviewThreads(first: 20) {
        nodes {
          id
          isResolved
          comments(first: 1) {
            nodes {
              body
              databaseId
            }
          }
        }
      }
    }
  }
}' --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false)'

# Then, resolve each addressed thread
gh api graphql -f query='
mutation {
  resolveReviewThread(input: {threadId: "{thread_id}"}) {
    thread {
      id
      isResolved
    }
  }
}'
```

### 4. Out-of-Scope Comments

For comments about pre-existing code or unrelated issues:
- Reply explaining why it's out of scope
- Suggest addressing in a separate PR
- Ask the reviewer to resolve the thread

**Do NOT** resolve out-of-scope threads yourself - the reviewer should do it.

## Testing Workflows Locally with act

When modifying GitHub Actions workflows, always test them locally using `act` before pushing:

```bash
# Test e2e workflow for a specific browser
./scripts/run-workflow-e2e-browser.sh chromium

# Test e2e workflow for all browsers
./scripts/run-workflow-e2e-all.sh

# Test other workflows
act -W .github/workflows/[workflow-name].yml
```

See [Testing Workflows Locally](testing-github-workflows-locally.md) for detailed instructions.

## Important Reminders

- **NEVER update git config**
- **NEVER run destructive/irreversible git commands** (like push --force, hard reset) unless explicitly requested
- **NEVER skip hooks** (--no-verify, --no-gpg-sign) unless explicitly requested
- **NEVER force push to main/master** - warn the user if they request it
- **Avoid git commit --amend** - only use when:
  1. User explicitly requested amend, OR
  2. Adding edits from pre-commit hook (check authorship first)
- Before amending: ALWAYS check authorship (`git log -1 --format='%an %ae'`)
