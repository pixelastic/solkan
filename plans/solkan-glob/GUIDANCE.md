## Guidance

This plan adds glob pattern support to solkan's allowlist matcher.

**Testing**
- Run tests: `yarn run test <filepath>`
- Run linter: `yarn run lint:fix <filepath>`
- Test files live in `lib/__tests__/`

**Key files**
- `lib/helpers/getMatchingGenericPattern.js` — matching logic to extend
- `lib/getMatchingPattern.js` — public API dispatcher (delegates git commands to git matcher, everything else to generic matcher)
- `lib/__tests__/getMatchingPattern.js` — unit tests to extend (tests public API)
- `lib/__tests__/isCommandLineAllowed.js` — integration tests to extend
- `package.json` — add `minimatch` as a direct dependency

**Conventions**
- Tests use `it.each` with an object table — follow the existing pattern in `getMatchingPattern.js`
- `getMatchingGitPattern` delegates back to `getMatchingGenericPattern` after normalisation — glob support is inherited automatically, no changes needed in the git path
- `isGlob` is a local function (not exported) — it is the sole extension point for glob detection logic

**Prior art**
- Existing `it.each` table in `lib/__tests__/getMatchingPattern.js` — follow this structure for new test cases
- Existing `it.each` table in `lib/__tests__/isCommandLineAllowed.js` — follow this structure for the integration test

## Discoveries

### Issue 01 — Glob matching

- minimatch's `*` does not match `/`, so `dir/foo*` correctly rejects `dir/foo/bar` — pass `simpleCommand` (full command with args) directly; no need to strip args first since spaces are not path separators.
- `isGlob` kept as a standalone module-private function (not in `__` object) — the `__` pattern is for mockable/injectable helpers; a one-liner pure predicate doesn't need it.
