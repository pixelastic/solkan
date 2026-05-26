## Execution order

issue-001 → start here, no blockers
issue-002 → needs issue-001
issue-003 → needs issue-002

## Guidance

- Use `yarn run test <filepath>` to run tests
- Use `yarn run lint:fix` to fix lint issues
- Tests live in `lib/__tests__/` (sibling of the file being tested)
- Follow `it.each` pattern with labeled cases — see existing tests for prior art
- Use named ES6 exports with `.js` extension on local imports
- JSDoc on all exported functions
- `lib/main.js` is the public API barrel — export new modules from there
- Do NOT test `bin/solkan` directly; unit-test `getCommandLineState` instead
- The `__` pattern (private methods object) is used for testable internals — follow it if needed

---
## Log (append below when an issue is completed)

## Session 2026-05-26 — 001: getMatchingPattern
- Completed: Added `getMatchingPattern` in `lib/getMatchingPattern.js`, refactored `isAllowed` as thin wrapper, exported from `lib/main.js`
- Tests added: `lib/__tests__/getMatchingPattern.js` (4 cases: single-word match, multi-word match, no match, empty list)
- Discovered: none
- Fixed: early return for empty allowList; simplified `isAllowed` tests to wrapper-only cases
- Skipped feedback: API surface judgement call (exporting `getMatchingPattern` is spec-required)
- Next: issue-002 — `getCommandLineState`

## Session 2026-05-26 — 002: getCommandLineState
- Completed: Added `getCommandLineState` in `lib/getCommandLineState.js`, refactored `isCommandLineAllowed` as thin wrapper, exported from `lib/main.js`
- Tests added: `lib/__tests__/getCommandLineState.js` (6 cases: single allowed, single rejected, pattern vs full command, mixed pipeline, dedup allowed, dedup rejected)
- Discovered: none
- Fixed: switched dedup from manual `.includes()` to `_.uniq` per review feedback
- Skipped feedback: isCommandLineAllowed test assertion update (tests pass, boolean return is the contract); CLI JSON output (issue-003 scope); return-early in _.each callback (stylistic, readable as-is)
- Next: issue-003 — CLI JSON output
