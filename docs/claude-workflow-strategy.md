# Claude Workflow Strategy

## Problem Analysis

We have two Claude workflows that are conflicting:

1. **claude.yml** - The default Claude workflow that triggers on `@claude` mentions
2. **claude-renovate.yml** - Our custom workflow for Renovate PRs

### Current Issues

1. **Authentication Problem**: The claude-renovate workflow failed with "User does not have write access on this repository" when trying to run the Claude action.

2. **Double Triggering**: When claude-renovate posts a comment with `@claude`, it should trigger the default claude.yml workflow, but this isn't happening correctly.

3. **Permission Mismatch**: The workflows have different permission sets:
   - claude.yml: Only has read permissions (contents: read)
   - claude-renovate.yml: Has write permissions (contents: write)

## Root Cause

The main issue is that **GitHub Actions cannot trigger other GitHub Actions** by default to prevent infinite loops. When the claude-renovate workflow posts a comment with `@claude`, it won't trigger the claude.yml workflow because:

1. Comments created by GitHub Actions don't trigger other workflows
2. The GITHUB_TOKEN used by actions has limitations

## Strategy: Single Unified Workflow

Instead of having the claude-renovate workflow try to trigger the main Claude workflow, we should:

### Option 1: Direct Claude Integration (Recommended)

Modify claude-renovate.yml to directly run Claude without posting a comment:

```yaml
# Instead of posting @claude comment and hoping claude.yml triggers,
# directly run the Claude action in claude-renovate.yml
```

Pros:
- No dependency on workflow triggering
- More control over the process
- Works with scheduled runs

Cons:
- Need to ensure proper authentication

### Option 2: Use PAT for Comment Triggering

Use a Personal Access Token (PAT) instead of GITHUB_TOKEN when posting comments:

```yaml
- uses: actions/github-script@v7
  with:
    github-token: ${{ secrets.CLAUDE_TRIGGER_PAT }}
```

Pros:
- Comments will trigger other workflows
- Maintains separation of concerns

Cons:
- Requires PAT setup
- Additional secret management

### Option 3: Merge Workflows

Combine both workflows into a single claude.yml that handles all cases:

```yaml
on:
  issue_comment:
    types: [created]
  pull_request:
    types: [opened, synchronize]
  schedule:
    - cron: '0 * * * *'
```

Pros:
- Single source of truth
- No workflow triggering issues

Cons:
- More complex workflow logic
- Harder to maintain

## Implemented Solution

We've implemented **Option 1** with the following changes:

1. Keep claude-renovate.yml as a dedicated Renovate handler
2. Don't post @claude comments (this avoids the workflow triggering issue)
3. Directly run the Claude action with proper context
4. Pass the Renovate context through environment variables

### Key Implementation Details

1. **Direct Claude Integration**: Instead of posting comments, we run claude-code-action directly
2. **Context Passing**: PR information is parsed and passed via RENOVATE_PR_CONTEXT env var
3. **Proper Permissions**: Added all necessary permissions including `actions: write`
4. **Smart PR Detection**: For scheduled runs, only process PRs with failing CI and no recent activity

### Authentication Configuration

The workflow uses:

```yaml
permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write
  actions: write
```

Required secrets:
- `CLAUDE_CODE_OAUTH_TOKEN` - For Claude authentication
- `GITHUB_TOKEN` - Automatically provided, used for checkout and API calls

### How It Works

1. **PR Events**: When Renovate creates/updates a PR, workflow runs immediately
2. **Scheduled Runs**: Every hour, checks for Renovate PRs with:
   - Failing CI checks
   - No Claude activity in last 2 hours
3. **Claude Execution**: Runs with full context about the PR, version changes, and confidence
4. **No Comment Loop**: Avoids the GitHub Actions limitation by not relying on comment triggers

## Testing Strategy

1. Test with a simple Renovate PR first
2. Verify Claude can make commits
3. Test scheduled runs
4. Monitor for any permission issues

## Future Improvements

1. Add better error handling
2. Implement retry logic
3. Add status reporting
4. Consider using GitHub App token for better permissions