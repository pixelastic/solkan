## TLDR

Add glob pattern support to the allowlist matcher using minimatch.

## What to build

Extend `getMatchingGenericPattern` so that any allowlist pattern containing `*` is matched as a glob against the simple command, using `minimatch`. Patterns without `*` continue to use the existing exact and prefix matching logic unchanged.

Introduce a local `isGlob(pattern)` predicate (returns `pattern.includes('*')`) as the single extension point for glob detection — future detection logic changes go here only.

Add `minimatch` as a direct dependency in `package.json`.

Write unit tests (via the public `getMatchingPattern` API) covering the full set of glob cases, and one integration test through `isCommandLineAllowed` for the primary use case.

## Behavioral Tests

**Glob matching — single wildcard**
- `dir/foo*` matches a script named exactly `foo`
- `dir/foo*` matches a script named `foobar` (no separator needed)
- `dir/foo*` matches a script named `foo` invoked with arguments
- `dir/foo*` does NOT match `dir/foo/bar` (`*` does not cross `/`)
- `dir/foo*` does NOT match `dir/bar` (wrong prefix)

**Glob matching — double wildcard**
- `dir/foo/**` matches `dir/foo/bar` (`**` crosses directory separators)

**Integration**
- Allowlist containing `/tmp/oroshi/claude/scripts/*` approves the command `/tmp/oroshi/claude/scripts/my-script` through the full `isCommandLineAllowed` pipeline

**Regression**
- Existing exact and prefix patterns (no `*`) continue to match as before

## Acceptance criteria

- [ ] `minimatch` added as a direct dependency
- [ ] Local `isGlob(pattern)` predicate encapsulates glob detection
- [ ] Glob branch added to the generic matcher — delegates to `minimatch` when `isGlob` returns true
- [ ] Unit tests cover all behavioral cases above (single `*`, double `**`, negative cases)
- [ ] Integration test covers the `/tmp/oroshi/claude/scripts/*` use case end-to-end
- [ ] All existing tests continue to pass
