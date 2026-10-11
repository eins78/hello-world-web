# Git Workflow Guide

This guide explains the Git workflow and PR management process for the hello-world-web project.

## Never Squash

**Never squash a PR into a single commit.** Each commit should be one meaningful, reviewable step
(types, dependency, endpoint, page, tests, docs). The history explains why the code looks the way it
does, and `git bisect` and `git revert` work on single steps.

Fixes do not become separate "fix lint" or "address review" commits in the final history either.
They are **fixup commits** that get folded into the commit they fix.

## Standard PR Workflow

1. Create feature branch from main
2. Implement the feature/fix as a series of meaningful commits
3. Run CI locally, push and check CI status
4. Fix CI failures and review comments with fixup commits (`git commit --fixup=<sha>`) and a plain `git push`
5. Before merging, fold the fixup commits into their targets with `git rebase -i --autosquash`
6. Only after CI is green on the final history is the PR ready to merge

## CI Workflow Process

### 1. Make Your Changes

Implement changes according to task requirements. Commit in meaningful steps.

### 2. Run CI Locally

Catch issues early before pushing:

```bash
pnpm run ci
```

This runs: clean → build & lint → e2e tests

### 3. Fix CI Failures and Review Comments with Fixup Commits

Commit each fix as a fixup of the commit that introduced the problem:

```bash
# Find the commit the fix belongs to
git log --oneline origin/main..HEAD

# Commit the fix as a fixup of that commit
git add packages/app/src/routes/api/ical.ts
git commit --fixup=<sha>

# Plain push: the existing history is unchanged, reviewers see exactly what changed
git push
```

- Keep pushing fixups until all CI checks are green
- Use [CI Troubleshooting Guide](ci-troubleshooting.md) for common issues
- Common problems:
  - ESLint formatting (auto-fixable with `pnpm run lint:eslint -- --fix`)
  - Unused exports (check with Knip)
  - TypeScript errors
  - Test failures

### 4. Fold the Fixups in Before Merging

Once review is done, fold every `fixup!` commit into its target. This rewrites the branch, so it
needs a force push with lease:

```bash
git fetch origin
git rebase -i --autosquash origin/main
# Non-interactive (scripts, agents): accept the generated todo list as is
# GIT_SEQUENCE_EDITOR=true git rebase -i --autosquash origin/main
git push --force-with-lease
```

`--autosquash` moves each `fixup! <subject>` commit right after the commit with that subject and
marks it as `fixup`, so the fix becomes part of that commit and its message is dropped. The other
commits stay as they are. Wait for CI to be green again on the rewritten history before merging.

Never use `squash` in the rebase todo list or `git reset --soft` to collapse commits, and do not use
GitHub's "Squash and merge" button.

### 5. Example

During review, the branch might look like this:

```
fixup! feat: add iCalendar demo page
fixup! feat: implement iCalendar API endpoint
test: add E2E tests for the iCalendar API
feat: add iCalendar demo page
feat: implement iCalendar API endpoint
```

After `git rebase -i --autosquash origin/main`:

```
test: add E2E tests for the iCalendar API
feat: add iCalendar demo page
feat: implement iCalendar API endpoint
```

## Addressing PR Review Comments

**CRITICAL: PRs are blocked until ALL relevant review comments are addressed AND resolved.**

When copilot or human reviewers leave comments on a PR, follow this workflow:

### 1. Address the Feedback

Make code changes to fix the issues raised in the comments. Commit each fix as a fixup of the commit
it belongs to (`git commit --fixup=<sha>`) and push normally.

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
- **NEVER run destructive/irreversible git commands** (like push --force, hard reset) unless explicitly requested. The one routine exception is `git push --force-with-lease` on a feature branch after folding in fixups (see "Fold the Fixups in Before Merging")
- **NEVER skip hooks** (--no-verify, --no-gpg-sign) unless explicitly requested
- **NEVER force push to main/master** - warn the user if they request it
- **Avoid git commit --amend** - only use when:
  1. User explicitly requested amend, OR
  2. Adding edits from pre-commit hook (check authorship first)
- Before amending: ALWAYS check authorship (`git log -1 --format='%an %ae'`)
