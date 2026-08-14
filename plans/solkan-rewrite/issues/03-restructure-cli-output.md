## TLDR

Move validation output under an `allow` key and require at least one feature flag.

## What to build

Restructure `bin/solkan` output format. Today:

```json
{"isAllowed": true, "commands": {"allowed": ["echo"], "rejected": []}}
```

After:

```json
{"allow": {"isAllowed": true, "allowed": ["echo"], "rejected": []}}
```

Changes to `bin/solkan`:
- Wrap `getCommandLineState` result under `allow` key: `allow.isAllowed`, `allow.allowed`, `allow.rejected`
- Exit code 2 when neither `--allow-list-file`/`--allow-list` nor `--rewrite-list-file` is passed
- `allow` key only present when `--allow-list-file`/`--allow-list` is passed

Update all existing CLI tests to match the new output shape.

`getCommandLineState` return value is unchanged — the CLI does the reshaping.

## Scaffolding Tests

- output has `allow` key containing `isAllowed`, `allowed`, `rejected` (was top-level)
- top-level `isAllowed` and `commands` keys no longer exist
- exit 2 when no feature flags passed
- existing exit code behavior unchanged for validation (0 = allowed, 1 = rejected)

## Acceptance criteria

- [ ] `allow` key wraps validation output
- [ ] No top-level `isAllowed` or `commands` keys
- [ ] Exit 2 when no flags passed
- [ ] All existing tests updated and passing
- [ ] `getCommandLineState` return value unchanged
