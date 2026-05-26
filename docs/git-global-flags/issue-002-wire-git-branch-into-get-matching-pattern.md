## PRD

[git-global-flags/PRD.md](./PRD.md)

## What to build

Add a git-specific early return at the top of `getMatchingPattern`: if `simpleCommand` starts with `"git "`, delegate immediately to `getMatchingGitPattern` and return its result. Non-git commands are unaffected.

Add a single happy-path test to the existing `getMatchingPattern` test suite confirming the delegation works end-to-end.

## Acceptance criteria

- [ ] `getMatchingPattern('git -C /path status', ['git status'])` returns `'git status'`
- [ ] All pre-existing `getMatchingPattern` tests still pass
- [ ] Non-git commands behave identically to before

## Blocked by

- [issue-001-get-matching-git-pattern.md](./issue-001-get-matching-git-pattern.md)
