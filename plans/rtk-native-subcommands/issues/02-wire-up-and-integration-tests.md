## TLDR

Wire `extractFromRtkCommand` into `extractSimpleCommands`, remove `rtk` from `PREFIX_COMMANDS`, and add user-facing integration tests.

## What to build

Two changes to `extractSimpleCommands`:
1. Remove `rtk` from `PREFIX_COMMANDS` — it is no longer a generic transparent prefix
2. In `extractFromNode`, add a check `if (commandName === 'rtk')` that delegates to `extractFromRtkCommand`, placed before the existing `PREFIX_COMMANDS` check

This makes the two already-failing tests in `extractSimpleCommands` pass (`rtk --version` → `['rtk --version']`, `rtk --help` → `['rtk --help']`).

Add user-facing integration tests to `isCommandLineAllowed` covering the full end-to-end path: allowlist lookup included.

## Behavioral Tests

**`isCommandLineAllowed` — rtk native subcommands accepted**
- `rtk --version` with allowlist `['rtk --version']` → `true`
- `rtk --help` with allowlist `['rtk --help']` → `true`
- `rtk rewrite "git status"` with allowlist `['rtk rewrite']` → `true`
- `rtk trust` with allowlist `['rtk trust']` → `true`
- `rtk config --create` with allowlist `['rtk config']` → `true`

**`isCommandLineAllowed` — rtk native subcommands rejected when not allowlisted**
- `rtk --version` with allowlist `['echo']` → `false`

**`isCommandLineAllowed` — rtk transparent wrapper behavior preserved (regression)**
- `rtk git status` with allowlist `['git status']` → `true`
- `rtk echo hello` with allowlist `['echo']` → `true`

## Acceptance criteria

- [ ] `rtk` is no longer in `PREFIX_COMMANDS`
- [ ] `extractFromNode` delegates to `extractFromRtkCommand` for `rtk` commands
- [ ] The 2 already-failing `extractSimpleCommands` tests now pass
- [ ] All new `isCommandLineAllowed` integration tests pass
- [ ] All pre-existing tests continue to pass
