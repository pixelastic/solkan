## Goal
Allow allowlist authors to approve all commands under a path or namespace prefix using glob patterns, without listing each command individually.

## Done

- Added `minimatch` as a direct dependency.
- Added local `isGlob(pattern)` predicate (`pattern.includes('*')`) as the sole glob-detection extension point.
- Extended `getMatchingGenericPattern` with a glob branch: when `isGlob` is true, the full `simpleCommand` (including arguments) is matched via `minimatch`. Existing exact/prefix logic is untouched.
- Added unit tests for: single-`*` exact, suffix, with-args, cross-directory negative, wrong-prefix negative; double-`**` positive and negative; plus explicit regression cases for exact/prefix patterns.
- Added integration test: `['/tmp/oroshi/claude/scripts/*']` approves `/tmp/oroshi/claude/scripts/my-script` end-to-end.

## Key files
- `lib/helpers/getMatchingGenericPattern.js` — core matching logic extended with glob branch
- `lib/__tests__/getMatchingPattern.js` — unit tests for glob cases
- `lib/__tests__/isCommandLineAllowed.js` — integration test for end-to-end glob approval
- `package.json` — minimatch added as a direct dependency

## Suggested type(scope)
`feat(glob-allowlist)`
