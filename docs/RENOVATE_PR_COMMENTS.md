# Renovate PR Comment Guidelines

<core_principle>
Maximum 3 lines, 200 characters. Default: "✅ CI green."
</core_principle>

<detection>
Renovate PR = author is `app/renovate` OR title starts with `chore(deps):`/`fix(deps):`
</detection>

<decision_tree>
1. Check CI: GREEN or FAILED?
2. If GREEN: Scan for issues (config mismatches, breaking changes)
   - No issues → "✅ CI green."
   - Version bump only → "✅ [package]: [old] → [new]. CI green."
   - Issue found → "⚠️ [specific issue + fix in 1 line]"
3. If FAILED → "❌ CI failed: [specific check name]"
4. Apply hard constraints: ≤3 lines, ≤200 chars
5. Run self-check before posting
</decision_tree>

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
ABSOLUTE LIMITS (non-negotiable):
1. ≤ 3 lines (physical line breaks)
2. ≤ 200 characters total
3. Must start with emoji: ✅ ⚠️ or ❌
4. No markdown headers (no ##, ###, etc.)
5. No sections or subsections
6. One comment per PR maximum
7. Must add value beyond PR description

If you cannot meet all constraints: Default to "✅ CI green."
</hard_constraints>

<self_check>
Before posting your comment, verify ALL of these:

□ Is it ≤ 3 lines?
□ Is it ≤ 200 characters?
□ Does it use the template format?
□ Does it start with ✅, ⚠️, or ❌?
□ Does it add value beyond the PR description?
□ Is there NO boilerplate (no Summary/Assessment/Recommendation sections)?
□ Are there NO markdown headers?

ALL ✓ → Post comment
ANY ✗ → Revise to meet constraints OR default to "✅ CI green."
</self_check>

<integration_note>
These guidelines work with:
- **CLAUDE.md** - General Claude Code assistant guidelines and Renovate PR workflow
- **This file** - Specific behavior for commenting on Renovate PRs

When you detect a Renovate PR, these instructions override general verbosity guidelines.
</integration_note>
