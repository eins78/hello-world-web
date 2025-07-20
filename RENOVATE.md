# Renovate PR Handling Guide

This document contains specific instructions for handling automated Renovate dependency update PRs.

## 🎯 Ultimate Goal

**Your mission: Process ALL pending dependency updates until the Dependency Dashboard is clear.**

- Continue working through PRs one by one until every update is either:
  - ✅ Merged (CI green, no issues)
  - ⏭️ Skipped (escalated to @eins78)
- Do NOT stop work until all updates are handled
- The Dependency Dashboard should show zero pending updates when you're done

## 1. Identify Update Type
- Check the PR description for update type (major/minor/patch)
- Look for breaking changes section in PR body
- Check linked changelog/release notes

## 2. 🚨 CRITICAL: One PR at a Time Rule

**Due to pnpm lockfile conflicts, you MUST only work on ONE dependency update at a time:**

1. **Never work on multiple Renovate PRs simultaneously**
2. **Never request rebase for more than one PR**
3. **Follow this workflow:**
   - Work on one PR until it's either merged or skipped
   - Only after completion, use the Dependency Dashboard issue
   - Check the box to request the next update or rebase
   - Wait for the new PR before starting work

**Why this matters:** Every dependency update modifies the pnpm lockfile, causing merge conflicts with all other update PRs. Working on multiple PRs wastes effort as only one can be merged.

## 3. Automated Approval Criteria

### Auto-approve and merge if ALL conditions are met:
- Update type is minor or patch
- All CI checks pass (after your fixes)
- No breaking changes mentioned
- Not in the special handling list below
- Merge confidence is not LOW (see section below)

### For Major Updates:
1. Always check the linked changelog/release notes
2. Search codebase for usage of changed APIs
3. Auto-approve if:
   - Breaking changes don't affect our code
   - You can fix any issues that arise
   - Changes are well-documented

## 4. Understanding Merge Confidence

Renovate provides merge confidence badges to help assess update safety:

### Confidence Levels:
- **✅ HIGH/VERY HIGH**: Very low chance of breaking changes, generally safe to merge
- **➖ NEUTRAL**: Insufficient data, proceed with normal caution
- **⚠️ LOW/VERY LOW**: Higher risk of issues, often expected for major updates

### How to Use:
- **HIGH confidence + PATCH/MINOR**: Strong signal to merge after CI passes
- **LOW confidence + MAJOR**: Expected, review breaking changes carefully
- **LOW confidence + PATCH/MINOR**: Unusual, investigate why (might have hidden breaking changes)
- Always run CI regardless of confidence level

## 5. Special Package Rules

### High Priority Packages (always review carefully):
- `lit`, `@lit/*`, `@lit-labs/*` - Core framework, check for API changes
- `typescript` - May introduce new strict checks
- `eslint` and plugins - May add new rules requiring fixes
- `playwright` - Check for API changes in test code

### When to Skip (Escalate to @eins78):

**Skip the PR and mention @eins78 when:**
- Breaking changes require architectural decisions (e.g., API redesign, migration strategy)
- Security updates have unclear impact on our application
- After 3 attempts, you cannot make CI green
- License changes from permissive to restrictive
- Package is not in our dependencies (might be a new sub-dependency)
- Update requires manual testing that you cannot perform
- Breaking changes affect core business logic you're unsure about

**When you skip:** 
1. Comment with the escalation format (see example below)
2. Do NOT close or dismiss the PR
3. Move to the next update via Dependency Dashboard
4. Continue processing other updates

## 6. Fix Process
1. Run `pnpm install` to update lockfile
2. Run `pnpm run ci` to check everything
3. Fix issues in this order:
   - TypeScript errors
   - Linting issues (use `pnpm run lint:eslint -- --fix`)
   - Test failures
4. Commit fixes with message: "fix: resolve issues from {package} update"
5. Ensure CI is green before approving
6. After PR is merged or skipped:
   - Go to the Dependency Dashboard issue
   - Check the box for the next update to process
   - Wait for Renovate to create/rebase the PR

## 7. Example Escalation Comment
```
@eins78 I need your input on this update:

**Package**: example-package v2.0.0 → v3.0.0
**Breaking Changes**:
- Removed `oldMethod()` - we use this in 3 files
- Changed default behavior of `configure()` 

**My Analysis**:
- We could migrate to `newMethod()` but it has different parameters
- The configuration change might affect our production behavior

**Recommendation**: [Approve/Delay/Skip] because...
```

## 8. Complete Workflow Summary

1. **Start**: Check Dependency Dashboard for pending updates
2. **Process**: Work on ONE PR at a time:
   - Try to fix and merge (for safe updates)
   - Or skip with @eins78 mention (for complex updates)
3. **Next**: Via Dependency Dashboard, request next PR
4. **Repeat**: Continue until Dashboard shows zero pending updates
5. **Done**: All dependencies are either updated or escalated

**Remember**: Your work is NOT complete until every single update is handled!