## Problem Statement

Solkan accepts a single `--allow-list-file` and a single `--rewrite-list-file`. The hook wrapper needs to pass both a global and a per-repo file for each flag. Today, the only workaround is merging files into a temp file before calling solkan.

## Solution

Accept multiple `--allow-list-file` and `--rewrite-list-file` flags. When minimist receives repeated flags it produces an array automatically. Solkan detects this, reads all files, and merges the results:

- Allowlist files (arrays): concatenate into one flat array
- Rewrite files (objects): shallow-merge, later files override earlier keys

## User Stories

1. As a hook wrapper author, I want to pass `--allow-list-file global.json --allow-list-file local.json`, so that I don't need to create temp merged files
2. As a hook wrapper author, I want to pass `--rewrite-list-file global.json --rewrite-list-file local.json`, so that per-repo rewrites override global ones
3. As a hook wrapper author, I want solkan to fail if a passed file doesn't exist, so that I catch config mistakes early
4. As a hook wrapper author, I want solkan to fail if a file contains the wrong JSON shape (object instead of array for allowlist, or vice versa for rewrite), so that I get clear diagnostics
5. As a user passing a single file, I want existing single-file behavior to keep working unchanged
6. As a hook wrapper author, I want the merge order to match argument order (left to right), so that I can reason about override precedence

## Implementation Decisions

- Two new modules: `loadAllowList(paths)` returns `string[]`, `loadRewriteMap(paths)` returns `Map`
- `loadAllowList` validates each file is an array using `_.isArray` from golgoth
- `loadRewriteMap` validates each file is a plain object using `_.isPlainObject` from golgoth
- `bin/solkan` normalizes the arg value to an array via `[].concat(value)` before passing to helpers
- `--allow-list` (inline comma-separated) stays mutually exclusive with `--allow-list-file` — no change
- Missing files are fatal — the caller is responsible for only passing files that exist
- `readJson` from firost handles file reading (same as today)
- `Map` conversion for rewrite data stays in `loadRewriteMap`, matching current bin/solkan responsibility

## Testing Decisions

- Test external behavior only: given file paths, assert on returned data or thrown errors
- Both helpers are tested: `loadAllowList` and `loadRewriteMap`
- Tests write temp JSON files to disk, pass their paths, assert results
- Test cases: single file, multiple files merged, missing file error, invalid shape error
- Prior art: `lib/__tests__/rewriteCommandLine.js` — same `describe`/`it.each` pattern

## Out of Scope

- Deprecating `--allow-list` (inline) — future work
- CLI integration tests (spawning the binary) — helpers cover the logic
- Glob or directory-based file discovery — caller passes explicit paths

## Further Notes

- minimist preserves argument order in arrays, so left-to-right = first-to-last in the array
- golgoth re-exports lodash as `{ _ }` — no new dependency needed
