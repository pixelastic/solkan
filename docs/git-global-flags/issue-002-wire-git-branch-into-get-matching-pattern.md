## PRD

[git-global-flags/PRD.md](./PRD.md)

## What to build

Three changes to wire up the full orchestration:

1. **Create `lib/helpers/getMatchingGenericPattern.js`** — extract the current prefix-match logic from `getMatchingPattern` into a dedicated helper with the same signature (`simpleCommand`, `allowList`) → `string | null`.

2. **Refactor `lib/getMatchingPattern.js`** into a pure orchestrator:
   - if `simpleCommand` starts with `"git "` → delegate to `getMatchingGitPattern`
   - otherwise → delegate to `getMatchingGenericPattern`

3. **Update `lib/helpers/getMatchingGitPattern.js`** to import and call `getMatchingGenericPattern` instead of `getMatchingPattern`, breaking the potential recursion cycle.

## Acceptance criteria

- [ ] `getMatchingPattern('git -C /path status', ['git status'])` returns `'git status'`
- [ ] `getMatchingPattern('echo hello', ['echo hello'])` returns `'echo hello'` (non-git unaffected)
- [ ] All pre-existing `getMatchingPattern` tests still pass
- [ ] `getMatchingGenericPattern` has its own test file `lib/helpers/__tests__/getMatchingGenericPattern.js`

## Blocked by

- [issue-001-get-matching-git-pattern.md](./issue-001-get-matching-git-pattern.md)
