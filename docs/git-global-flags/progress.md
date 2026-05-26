## Execution order

issue-001 → start here, no blockers
issue-002 → needs issue-001

## Guidance

- All source files live under `lib/`. New helpers go in `lib/helpers/`, their tests in `lib/helpers/__tests__/`.
- Tests use `it.each` with `commandLine` + input/output shape — see `lib/helpers/__tests__/extractCommandLineFromXargs.js` for prior art.
- The project uses ESM (`import`/`export`), `golgoth` for `_` utilities.
- Run tests with `yarn run test` from the repo root.
- Do not modify files outside `lib/` unless the issue explicitly requires it.

---
## Log (append below when an issue is completed)

## Session 2026-05-26 — 001: getMatchingGitPattern
- Completed: `lib/helpers/getMatchingGitPattern.js` with full global-flag stripping; 10 tests
- Tests added: `lib/helpers/__tests__/getMatchingGitPattern.js` (10 cases via it.each)
- Discovered: Review flagged potential recursion once issue-002 lands; fixed by inlining prefix-match logic instead of calling `getMatchingPattern`
- Fixed: Test shape aligned to prior art (`commandLine` field, `$commandLine` label, `.toEqual()`); `__findSubcommand` renamed to `findSubcommand` (unexported private fn)
- Skipped feedback: "Missing longer-entry-wins test" (not in issue-001 AC); "Issue-002 not implemented" (separate issue)
- Next: issue-002 — wire git branch into getMatchingPattern
