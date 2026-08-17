## TLDR

Rewire `bin/solkan` to normalize args to arrays and delegate to `loadAllowList` / `loadRewriteMap`.

## What to build

Modify `bin/solkan`:

- Import `loadAllowList` and `loadRewriteMap`
- When `args['allow-list-file']` is present, normalize to array via `[].concat(value)` and call `loadAllowList(paths)`
- When `args['rewrite-list-file']` is present, normalize to array via `[].concat(value)` and call `loadRewriteMap(paths)`
- Remove the inline file-reading and validation logic that now lives in the helpers
- Keep `--allow-list` (inline) path unchanged and mutually exclusive with `--allow-list-file`
- Error handling: catch helper throws, print to stderr, exit 2 (same as today)

## Scaffolding Tests

No new tests — the logic is tested via the helpers. This is a wiring-only change that removes code from the binary.

## Acceptance criteria

- [ ] `bin/solkan` uses `loadAllowList` for `--allow-list-file`
- [ ] `bin/solkan` uses `loadRewriteMap` for `--rewrite-list-file`
- [ ] Single-file invocations still work (backward compatible)
- [ ] Multi-file invocations work end-to-end
- [ ] Inline `--allow-list` still works unchanged
