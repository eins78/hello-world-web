# Renovate Configuration

## Overview

This project uses an optimized Renovate configuration with:

1. **Node.js LTS Only** - Only accepts Node.js **LTS (Long Term Support)** releases, not "Current" releases
2. **"Update Friday" Schedule** - New PRs created only on Fridays (reduces weekday noise)
3. **Aggressive Grouping** - Groups updates to minimize PR count and rebase cascades
4. **Dependency Dashboard** - Manual approval for major updates

## Current LTS Version

- **Node.js 22.x** - Active LTS (code name: [will be assigned when LTS starts])

## Update Strategy

### "Update Friday" Schedule

**New PRs**: Created only on **Fridays between 7am-7pm CET**
- Reduces weekday notification noise
- Allows focused time for reviewing updates during business hours
- 12-hour daytime window gives Renovate ample time to process all updates
- Security updates still create PRs immediately (not delayed)

**Rebasing**: Only when actual merge conflicts exist
- Prevents cascading rebases when PRs fall behind base branch
- Reduces unnecessary CI runs
- Manual rebases available via dependency dashboard

### Grouping Strategy

**All non-major updates** are grouped into a single PR per week:
- Reduces PR count by ~90%
- Minimizes rebase cascades (fewer open PRs = fewer rebases needed)
- Works with automerge for passing updates

**Major updates** require manual approval via dependency dashboard:
- Prevents automatic breaking changes
- Allows batch review on Fridays

### PR Limits

- **Maximum 5 concurrent PRs** to prevent CI overload
- Additional updates shown in dependency dashboard
- Node.js updates have highest priority (processed first)

## Why LTS Only?

- **Stability**: LTS releases receive long-term support and critical bug fixes
- **Production-ready**: LTS versions are recommended for production environments
- **Predictability**: Avoids frequent breaking changes from Current releases
- **Support timeline**: 30 months of active support + 18 months maintenance

## Configuration Details

### Renovate Settings (`.renovaterc`)

Our configuration includes:

1. **Scheduling**:
   ```json
   {
     "schedule": ["* 7-18 * * 5"],
     "timezone": "Europe/Berlin"
   }
   ```
   Creates new PRs only on Fridays between 7am-7pm CET (12-hour daytime window).

2. **Rebase Strategy**:
   ```json
   {
     "rebaseWhen": "conflicted"
   }
   ```
   Only rebases when merge conflicts exist, not when PRs fall behind base branch.

3. **Grouping Presets**:
   - `group:allNonMajor` - Groups all minor/patch updates into one PR
   - `group:recommended` - Groups popular monorepos
   - `group:linters` - Groups linting tools
   - `group:test` - Groups testing packages
   - `:dependencyDashboard` - Enables GitHub issue for pending updates

4. **PR Limits**:
   ```json
   {
     "prConcurrentLimit": 5
   }
   ```
   Maximum 5 open PRs at once to prevent CI overload.

5. **Node.js LTS Constraints**:
   ```json
   {
     "matchPackageNames": ["node", "@types/node"],
     "matchDatasources": ["node-version", "npm", "docker"],
     "allowedVersions": "<23",
     "prPriority": 10
   }
   ```
   Prevents updates to Node.js 24 (Current) and prioritizes Node.js updates.

6. **Workaround Presets**:
   - `workarounds:typesNodeVersioning` - Ensures `@types/node` uses Node.js versioning
   - `workarounds:nodeDockerVersioning` - Ensures Docker `node` images use Node.js versioning

7. **Major Update Approval**:
   ```json
   {
     "matchUpdateTypes": ["major"],
     "dependencyDashboardApproval": true
   }
   ```
   Requires manual approval for major updates via dependency dashboard.

### What Gets Updated

- `.node-version` - Used by GitHub Actions
- `package.json` engines.node
- `@types/node` in package.json devDependencies
- `Dockerfile` base images (e.g., `node:22.21.1-alpine`)

### Dependency Dashboard

Renovate creates a GitHub issue titled "Dependency Dashboard" that shows:
- All pending updates (including rate-limited ones)
- Manual approval checkboxes for major updates
- Rebase/retry options for failed PRs
- Deprecated/abandoned package warnings

**Location**: Check your repository's Issues tab for "Dependency Dashboard"

### Debugging Grouped PRs

When a grouped PR fails CI:

1. **Check the PR description** - Lists all included updates
2. **Review CI logs** - Identify which package caused the failure
3. **Options**:
   - Fix the issue and push to the PR branch
   - Close the PR and use dependency dashboard to create individual PRs
   - Add problematic package to separate group or exclude from grouping

### Maintenance

**Node.js LTS Updates** (approximately once per year):

When Node.js 24 becomes LTS (expected April 2026), update `allowedVersions` in `.renovaterc`:

```json
"allowedVersions": "<25"
```

**Schedule Adjustments**:

To change the update window, modify the cron pattern in `.renovaterc`:
- Current: `"* 7-18 * * 5"` = Fridays 7am-7pm (12-hour daytime window)
- Early morning: `"* 0-6 * * 5"` = Fridays midnight-7am (7 hours)
- Business hours: `"* 9-17 * * 5"` = Fridays 9am-5pm (8 hours)
- Daily daytime: `"* 7-18 * * *"` = Every day 7am-7pm

## References

- [Node.js Release Schedule](https://github.com/nodejs/release#release-schedule)
- [Renovate Node.js Versioning](https://docs.renovatebot.com/modules/versioning/node/)
- [Renovate Scheduling](https://docs.renovatebot.com/key-concepts/scheduling/)
- [Renovate Noise Reduction](https://docs.renovatebot.com/noise-reduction/)
- [Renovate Group Presets](https://docs.renovatebot.com/presets-group/)
- [Renovate Dependency Dashboard](https://docs.renovatebot.com/key-concepts/dashboard/)
- [Renovate Configuration Options](https://docs.renovatebot.com/configuration-options/)
