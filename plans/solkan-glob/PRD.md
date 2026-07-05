## Problem Statement

The allowlist only supports exact and prefix matching — there is no way to allow all commands under a given path prefix or command namespace. Adding `/tmp/oroshi/claude/scripts/` to the allowlist does nothing for scripts inside that directory, because each script path is a unique string that would need to be listed individually. This makes directory-level auto-approval impossible.

## Solution

Add glob pattern support to the allowlist matcher. Any pattern containing `*` is treated as a glob and matched using `minimatch`. Patterns without `*` continue to use the existing exact and prefix matching logic unchanged.

Users can now add `/tmp/oroshi/claude/scripts/*` to their allowlist and any script in that directory will be auto-approved. The `*` wildcard does not cross directory separators; `**` is needed for recursive matching.

## User Stories

1. As an allowlist author, I want to use `*` in a pattern so that I can allow all commands sharing a common prefix without listing each one individually.
2. As an allowlist author, I want `/tmp/scripts/*` to match `/tmp/scripts/my-script`, so that scripts auto-generated in that folder are approved without manual intervention.
3. As an allowlist author, I want `/tmp/scripts/*` to match `/tmp/scripts/foo --arg`, so that scripts invoked with arguments are also approved.
4. As an allowlist author, I want `/tmp/scripts/*` to NOT match `/tmp/scripts` (no trailing component), so that the directory itself is not accidentally approved.
5. As an allowlist author, I want `/tmp/scripts/*` to NOT match `/other/scripts/foo`, so that the pattern is scoped to the intended directory.
6. As an allowlist author, I want `*` to NOT cross directory separators by default, so that `dir/foo*` does not inadvertently approve `dir/foo/bar`.
7. As an allowlist author, I want `**` to cross directory separators, so that I can allow a full subtree when needed.
8. As an allowlist author, I want exact and prefix patterns (no `*`) to keep working exactly as before, so that existing allowlists require no changes.
9. As an allowlist author, I want a bare `*` pattern to approve every command, so that I can opt into a fully permissive mode when appropriate.
10. As an allowlist author, I want `foo*` (no separator before `*`) to match `foobar` and `foo --arg`, so that the pattern author controls the granularity.
11. As a developer integrating solkan, I want glob detection to be encapsulated in a named local predicate, so that the detection logic can be extended later without touching the matching call site.

## Implementation Decisions

- **Glob detection** is encapsulated in a local predicate `isGlob(pattern)` that returns true when the pattern contains `*`. This keeps the detection logic in one place and makes it easy to extend (e.g., to detect `?`, `[]`, `{}`) without changing the matching call site.
- **Glob matching** delegates to `minimatch(simpleCommand, pattern)` when `isGlob(pattern)` is true. `minimatch` is added as a direct dependency.
- **Match ordering** is unchanged: patterns are sorted by descending length before matching, so longer (more specific) patterns win regardless of whether they are globs or literals.
- **`*` does not cross `/`**: this is minimatch's default behavior and matches standard glob semantics. Authors who need recursive matching use `**`.
- **Existing branches are untouched**: the exact-match and prefix-match branches remain in place and execute for all patterns without `*`.
- **No new dependency on `is-glob`**: the `pattern.includes('*')` check inside `isGlob` is sufficient for the required detection. More sophisticated detection can replace this single function later.
- **`minimatch` is canonical**: firost (an existing dependency) already relies on `multimatch`, which wraps `minimatch`. Using `minimatch` directly is consistent with the ecosystem.
- **Git commands are unaffected**: `getMatchingGitPattern` normalises the command then delegates to `getMatchingGenericPattern`, so glob support is inherited automatically without any changes to the git path.

## Testing Decisions

Good tests verify observable behaviour through the public API, not internal implementation details (e.g., they do not import or assert on `isGlob` directly).

**Unit tests — allowlist pattern matching**

Tests are written against the top-level `getMatchingPattern` function, which is the public API for pattern resolution. Prior art: the existing `it.each` table in the `getMatchingPattern` test file.

Cases to cover (pattern `dir/foo*`):

| Command | Expected result |
|---|---|
| `dir/foo` | matched (exact prefix) |
| `dir/foobar` | matched (no separator needed) |
| `dir/foo --arg` | matched (with arguments) |
| `dir/foo/bar` | no match (`*` does not cross `/`) |
| `dir/bar` | no match (wrong prefix) |
| `dir/foo/bar` with pattern `dir/foo/**` | matched (`**` crosses `/`) |

**Integration test — full pipeline**

One case is added to the `isCommandLineAllowed` integration test to verify that a glob allowlist entry approves a matching script command end-to-end through the full extraction and matching pipeline.

## Out of Scope

- Git-specific glob patterns (`getMatchingGitPattern`) — git commands inherit glob support automatically via delegation to `getMatchingGenericPattern`.
- CLI interface / `--allow-list` flag parsing changes.
- Changes to any `allowlist.json` in consuming projects (e.g. oroshi) — done after solkan ships.
- Support for `?`, `[]`, `{}` glob syntax — not needed for the current use case; `isGlob` is the extension point.
- `minimatch` option tuning (e.g. `dot`, `nocase`) — defaults are appropriate.
