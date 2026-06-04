## Issue 01 — Extract from rtk command helper

### it.each key naming: `commandLine` vs `input`

```javascript
it.each([
  { commandLine: 'rtk --version', expected: ['rtk --version'] },
  ...
])('$commandLine', ({ commandLine, expected }) => {
```

**Problem:** Reviewer flagged `commandLine` as a non-standard key; standard specifies `input`/`expected`.
**Reason skipped:** The standard also says "If multiple inputs, use one named key per input" — `commandLine` is a named key. This matches the existing codebase pattern (see `getMatchingGitPattern` tests) and is more readable than a generic `input` name.
