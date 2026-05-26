## PRD

[rich-output/PRD.md](./PRD.md)

## What to build

Add `getMatchingPattern(simpleCommand, allowList)` — a new deep module that returns the first allowlist pattern that matches the given simple command (using the existing prefix-match rule: exact match or `pattern + ' '` prefix), or `null` if none matches. Export it from the package's public API.

Then refactor `isAllowed` to be a thin wrapper: `getMatchingPattern(simpleCommand, allowList) !== null`. Update its tests to reflect that the matching logic now lives in `getMatchingPattern`.

## Acceptance criteria

- [ ] `getMatchingPattern('echo hello', ['echo'])` returns `'echo'`
- [ ] `getMatchingPattern('git status --short', ['git status'])` returns `'git status'`
- [ ] `getMatchingPattern('wget evil.com', ['echo'])` returns `null`
- [ ] `getMatchingPattern` is exported from the package public API
- [ ] `isAllowed` is reimplemented as a wrapper over `getMatchingPattern`
- [ ] All existing `isAllowed` tests still pass
- [ ] New `getMatchingPattern` tests cover: match returns pattern string, no match returns null, multi-word pattern match

## Blocked by

None — can start immediately
