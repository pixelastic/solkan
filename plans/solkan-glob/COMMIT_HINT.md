## Goal
Allow allowlist authors to approve all commands under a path or namespace prefix using glob patterns, without listing each command individually.

## Done
<replace when implementation is complete>

## Key files
- `lib/helpers/getMatchingGenericPattern.js` — core matching logic extended with glob branch
- `lib/__tests__/getMatchingPattern.js` — unit tests for glob cases
- `lib/__tests__/isCommandLineAllowed.js` — integration test for end-to-end glob approval
- `package.json` — minimatch added as a direct dependency

## Suggested type(scope)
`feat(glob-allowlist)`
