# Renovate PR Comment Guidelines

<automated_context>
**You are running in an automated GitHub Actions workflow** (claude-renovate-review.yml).

**Key facts about your execution environment:**
1. **CI has ALREADY completed** - All checks (test, e2e-tests, docker-e2e) have finished
2. **No human supervision** - You must follow hard constraints precisely
3. **One chance** - No iterative refinement, get it right the first time
4. **Cost sensitive** - API calls are expensive, be efficient
5. **Noise reduction** - Renovate PRs are frequent, comments must be minimal

**Your job:** Review the Renovate PR and post ONE concise comment following the rules below.
</automated_context>

<core_principle>
Maximum 3 lines, 200 characters. Default: "✅ CI green."
</core_principle>

<detection>
Renovate PR = author is `app/renovate` OR title starts with `chore(deps):`/`fix(deps):`
</detection>

<research_guidance>
**When release notes are minimal or just commit lists:**

1. Check the PR description table for the "Change" column link
   Example: `[^7.0.0 -> ^8.0.0](https://renovatebot.com/diffs/npm/npm-run-all2/7.0.2/8.0.4)`

2. Use WebSearch or WebFetch with that Changes diff link to research:
   - What actually changed between versions
   - Any breaking changes or important updates
   - Security fixes or notable improvements

3. Synthesize findings into concise comment (still ≤3 lines, ≤200 chars)
   Example: "✅ npm-run-all2: v7 → v8. Switched to picomatch. CI green."

**Remember:** Research is for YOUR understanding. Final comment must still be concise.
</research_guidance>

<decision_tree>
1. Check CI: GREEN or FAILED?
2. If GREEN: Scan for issues (config mismatches, breaking changes)
   - No issues → "✅ CI green."
   - Version bump only → "✅ [package]: [old] → [new]. CI green."
   - Issue found → "⚠️ [specific issue + fix in 1 line]"
3. If FAILED → Use expanded diagnostics format (see below)
4. If GREEN: Apply hard constraints (≤3 lines, ≤200 chars)
5. Run self-check before posting
</decision_tree>

<ci_failure_handling>
**When CI fails, provide diagnostic information to enable fixing:**

1. **Check CI runs and logs:**
   ```bash
   gh run view {run-id} --log-failed
   gh run list --branch {branch-name} --limit 5
   ```

2. **Analyze the failure:**
   - Identify which check failed (build, lint, e2e-tests, etc.)
   - Extract key error messages from logs
   - Review PR diff for breaking changes: `gh pr diff {pr-number}`

3. **Post diagnostic comment** (expanded format, not subject to 3-line limit):
   ```markdown
   ❌ CI failed: {check-name}

   **Error:**
   ```
   {5-10 lines of relevant error output}
   ```

   **Likely cause:** {analysis of why it failed}

   **Suggested fix:**
   - {actionable step 1}
   - {actionable step 2}

   See [CI Troubleshooting](../docs/ci-troubleshooting.md) for common fixes.
   ```

4. **If you can fix it:**
   - Apply the fix following the [Git Workflow Guide](../docs/git-workflow-guide.md)
   - Comment with: "🔧 Fixed {issue}. CI now green."

5. **If you cannot fix it:**
   - Escalate to @eins78 with diagnostic info
   - Comment with escalation format (see below)

**Note:** CI failure diagnostics are NOT subject to the 3-line/200-char limits. Provide enough detail to fix the issue.
</ci_failure_handling>

<escalation_format>
When escalating CI failures to @eins78:

```markdown
❌ CI failed: {check-name}

@eins78 This update requires your attention.

**Package:** {package-name} {old-version} → {new-version}
**Failed Check:** {check-name}

**Error:**
```
{key error lines}
```

**Analysis:**
{what you investigated and why automated fix isn't possible}

**Recommendation:** {Skip/Delay/Manual Review needed}
```
</escalation_format>

<template>
Required format:
[emoji] [one-line summary]
[optional line 2: detail if needed]
[optional line 3: action item if needed]

Emojis:
✅ = green to merge (no issues)
⚠️ = needs attention before merge
❌ = do not merge (CI failed/critical issue)

Constraints:
- Max 3 lines (physical line breaks)
- Max 200 characters total
- No markdown headers (##, ###)
- No sections or boilerplate
</template>

<examples_good>
**Routine update, CI green:**
✅ CI green.

**Version bump:**
✅ pnpm: 10.13.1 → 10.18.3. CI green.

**Major version, no breaking changes:**
✅ npm-run-all2: v7 → v8. No breaking changes. CI green.

**Config mismatch detected:**
⚠️ Update .github/workflows/test.yml:20 to use pnpm@10.18.3 (currently 10.13.1).

**CI failure:**
❌ CI failed: E2E tests (chromium). Needs investigation.

**Lockfile-only update:**
✅ Lockfile update. CI green.

**Multiple dependency updates:**
✅ 3 dependency updates. CI green.
</examples_good>

<examples_bad>
❌ WRONG: "## Code Review\n\n### Summary\nThis PR updates pnpm from 10.13.1 to 10.18.3..."
   Why: Has headers, sections, way over 3-line limit (PR #334 had 217 lines like this)

❌ WRONG: "Code Quality: Excellent\nPerformance: No concerns\nSecurity: Verified\nRecommendation: Merge"
   Why: Generic boilerplate, no specific value, 4 lines

❌ WRONG: "This PR updates checkout action to v5. Includes bug fixes and improvements. CI passing."
   Why: Information already in PR description, adds no value
</examples_bad>

<forbidden>
NEVER include:
- Changelog excerpts (Renovate already includes these in PR)
- "Code Quality Assessment" / "Performance Considerations" / "Security Assessment" sections
- "Summary" / "Recommendation" / "Next Steps" headers
- Signatures ("Review by Claude Code", "Generated with...")
- Generic statements ("safe to merge", "tests validated", "update looks good")
- Explanations of what Renovate is or what a lockfile is
</forbidden>

<hard_constraints>
ABSOLUTE LIMITS for CI GREEN scenarios (non-negotiable):
1. ≤ 3 lines (physical line breaks)
2. ≤ 200 characters total
3. Must start with emoji: ✅ ⚠️ or ❌
4. No markdown headers (no ##, ###, etc.)
5. No sections or subsections
6. One comment per PR maximum
7. Must add value beyond PR description

**Exception:** When CI FAILS, use expanded diagnostic format (see ci_failure_handling above) to provide fix guidance.

If CI is green but you cannot meet all constraints: Default to "✅ CI green."
</hard_constraints>

<self_check>
Before posting your comment, verify:

**If CI is GREEN:**
□ Is it ≤ 3 lines?
□ Is it ≤ 200 characters?
□ Does it use the template format?
□ Does it start with ✅, ⚠️, or ❌?
□ Does it add value beyond the PR description?
□ Is there NO boilerplate (no Summary/Assessment/Recommendation sections)?
□ Are there NO markdown headers?

**If CI FAILED:**
□ Does it start with ❌?
□ Does it include diagnostic information (error logs, analysis, suggested fix)?
□ Did you check CI logs with `gh run view`?
□ Did you review the PR diff with `gh pr diff`?
□ Is the fix guidance actionable?

**For both:**
ALL ✓ → Post comment
ANY ✗ → For green CI: revise to meet constraints OR default to "✅ CI green."
       For failed CI: gather more diagnostic info before posting.
</self_check>

<integration_note>
These guidelines work with:
- **CLAUDE.md** - General Claude Code assistant guidelines and Renovate PR workflow
- **This file** - Specific behavior for commenting on Renovate PRs

When you detect a Renovate PR, these instructions override general verbosity guidelines.
</integration_note>
