# Renovate PR Comment Guidelines

This document provides specific instructions for Claude Code when reviewing Renovate-generated PRs. The goal is to minimize noise while still providing value.

## Core Principle

**For Renovate PRs: Brevity is key.** Most updates are routine and automated. Comments should be concise and only flag genuinely unusual issues.

## Detecting Renovate PRs

A PR is a Renovate PR if:
- Author is `app/renovate` or `renovate[bot]`
- Title starts with `chore(deps):`, `fix(deps):`, or similar conventional commit format
- PR description contains Renovate formatting (badges, changelogs, etc.)

## Comment Length Guidelines

### Routine Updates (95% of cases)

For standard dependency updates where CI is green and nothing is unusual:

**Maximum comment length: 2-3 lines**

Examples:
```
✅ Routine dependency update. CI green.
```

```
✅ Minor version bump, lockfile updated. CI green.
```

```
✅ Patch update with bug fixes. CI green.
```

### Updates Requiring Attention (5% of cases)

Only provide detailed comments when you detect:

1. **CI failures** - Flag the specific failure
2. **Breaking changes** that might affect the codebase
3. **Security issues** mentioned in changelogs
4. **Configuration mismatches** (e.g., version hardcoded in CI that needs updating)
5. **Major version jumps** with significant changes
6. **Dependency conflicts** or peer dependency issues

Even then, keep it focused. Maximum 1-2 short paragraphs.

Example:
```
⚠️ CI workflow mismatch detected:
- package.json: pnpm@10.18.3
- .github/workflows/test.yml:20: pnpm@10.13.1

Update test.yml line 20 to match before merging.
```

## Category-Specific Guidelines

### Lockfile-Only Updates

**What they are:** Only `pnpm-lock.yaml` changes, no package.json modifications

**Comment template:**
```
✅ Lockfile update. CI green.
```

**Do NOT:**
- List every transitive dependency change
- Explain what a lockfile update means
- Provide security analysis for indirect dependencies
- Suggest running tests (they already ran in CI)

### Simple Version Bumps

**What they are:** Single package update in package.json + lockfile

**Comment template for minor/patch:**
```
✅ [package-name]: [old-version] → [new-version]. CI green.
```

**Comment template for major (if no issues):**
```
✅ [package-name]: v[X] → v[Y] (major). No breaking changes affecting our usage. CI green.
```

### GitHub Actions Updates

**What they are:** Changes to `.github/workflows/*.yml` files

**Comment template:**
```
✅ [action-name]: v[X] → v[Y]. CI green.
```

**Only expand if:**
- Breaking changes in action's release notes affect our usage
- Required workflow changes not yet applied
- Security concerns

### Multiple Small Updates (Grouped PRs)

**Comment template:**
```
✅ [N] dependency updates. CI green.
```

## What NOT to Include

**Never include these in Renovate PR comments:**

1. ❌ **Obvious information already in PR description**
   - Changelog excerpts (Renovate already includes these)
   - Release note summaries
   - Version comparison details

2. ❌ **Standard CI process explanations**
   - "CI checks are passing" (we can see the badges)
   - "Tests validated the change" (that's what CI does)
   - Generic statements like "Update is safe to merge"

3. ❌ **Boilerplate sections**
   - "Summary" headers
   - "Code Quality Assessment" (for dependency updates?!)
   - "Performance Considerations" (unless genuinely relevant)
   - "Security Assessment" (unless actual security issue found)
   - "Recommendation" sections
   - "References" to changelogs (already in PR)
   - Signatures like "Review completed by Claude Code"

4. ❌ **Redundant acknowledgments**
   - Explaining what Renovate is
   - Thanking Renovate for the PR
   - Praising routine updates

## Comment Format

When you must comment, use this minimal format:

```
[Status emoji] [One-line summary]
[Optional: One-line caveat or action item if needed]
```

Status emojis:
- ✅ Green to merge (everything normal)
- ⚠️ Needs attention before merge
- ❌ Do not merge (critical issue)

## Examples from This Repo

### ❌ TOO VERBOSE (Current Behavior - Don't Do This)

PR #334 (pnpm update) received 6 separate comments, each 50+ lines long, including sections like:
- "Code Quality & Best Practices"
- "Security Considerations"
- "Performance Considerations"
- "Notable Improvements in This Update"
- Full changelog excerpts
- Testing recommendations

**This is way too much for a minor version bump of a build tool.**

### ✅ CORRECT (Desired Behavior)

**For PR #334 (pnpm 10.13.1 → 10.18.3):**
```
⚠️ Update .github/workflows/test.yml:20 to use pnpm@10.18.3 (currently 10.13.1).
```

**For PR #341 (npm-run-all2 v7 → v8):**
```
✅ Major version bump. No breaking changes affecting our scripts. CI green.
```

**For PR #335 (actions/checkout v4 → v5):**
```
✅ Standard action update. CI green.
```

**For a truly routine update:**
```
✅ CI green.
```

## Special Case: CI Failures

If CI fails on a Renovate PR:

```
❌ CI failed: [specific test/check that failed]

[One-line explanation if the cause is clear]
[Or: "Needs investigation" if not immediately obvious]
```

## Integration with Existing Guidelines

These guidelines **complement** RENOVATE.md (which is for human maintainers) and CLAUDE.md (general assistant guidelines).

- RENOVATE.md: Tells humans how to handle Renovate PRs
- CLAUDE.md: Tells Claude Code general best practices
- **This file**: Tells Claude Code specifically how to comment on Renovate PRs

## Summary

**Default behavior for Renovate PRs:**
1. Verify CI is green
2. Scan for unusual issues (CI failures, breaking changes, config mismatches)
3. If nothing unusual: Comment `✅ CI green.` or similar (2-3 words max)
4. If something unusual: One focused comment, max 2-3 lines, stating the specific issue
5. Never provide boilerplate analysis, summaries, or recommendations

**Remember:** Renovate PRs are automated. The PR description already contains all the context. Your job is to flag exceptions, not to narrate the obvious.
