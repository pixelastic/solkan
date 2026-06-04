# RTK Native Subcommands

## Problem Statement

When Claude runs `rtk --version`, `rtk --help`, or `rtk rewrite <cmd>` via the Bash tool, the pre-tool-use hook incorrectly rejects them. The hook calls solkan, which treats `rtk` as a transparent prefix command (like `time`) and strips it unconditionally — leaving `--version`, `--help`, or `rewrite <cmd>` as the extracted command. These don't match the allowlist entries (`rtk --version`, `rtk --help`, `rtk rewrite`), so they are rejected with confusing error messages like "❌ --version, --help ❌".

## Solution

Introduce a dedicated extraction path for `rtk` in solkan. A hardcoded list (`RTK_NATIVE_SUBCOMMANDS`) identifies the subcommands and flags where `rtk` is the real actor (not a transparent wrapper). When `rtk` is called with a native subcommand, the full command is preserved for allowlist matching. When `rtk` is called as a transparent wrapper (e.g. `rtk git status`), existing behavior is preserved — `rtk` is stripped and the wrapped command is checked.

## User Stories

1. As Claude, I want `rtk --version` to be accepted by the hook when `rtk --version` is in the allowlist, so that I can check the rtk version without being blocked.
2. As Claude, I want `rtk --help` to be accepted by the hook when `rtk --help` is in the allowlist, so that I can consult rtk's help without being blocked.
3. As Claude, I want `rtk rewrite <cmd>` to be accepted by the hook when `rtk rewrite` is in the allowlist, so that I can call rtk's rewrite subcommand directly.
4. As Claude, I want `rtk trust` to be accepted by the hook when `rtk trust` is in the allowlist, so that I can manage rtk's trusted projects.
5. As Claude, I want `rtk config` to be accepted by the hook when `rtk config` is in the allowlist, so that I can inspect or create rtk's configuration.
6. As Claude, I want `rtk git status` to still be accepted when `git status` is in the allowlist, so that the transparent wrapper behavior is preserved.
7. As Claude, I want `rtk echo hello` to still be accepted when `echo` is in the allowlist, so that all existing transparent-wrapper use cases continue to work.
8. As a developer, I want `RTK_NATIVE_SUBCOMMANDS` to be easy to extend with new entries, so that future native subcommands can be added without touching extraction logic.

## Implementation Decisions

- `rtk` is removed from `PREFIX_COMMANDS`. It is no longer considered a generic transparent prefix — it has its own dedicated extraction path.
- A new helper module (`extractFromRtkCommand`) is created, following the same pattern as `getMatchingGitPattern` for git-specific logic.
- `RTK_NATIVE_SUBCOMMANDS` is a hardcoded list defined in the new helper. Initial contents: `['rewrite', '--version', '--help', 'trust', 'config']`. It contains only subcommands/flags encountered in practice that caused real rejections.
- The extraction logic in the new helper: if the first suffix token of the `rtk` AST node matches an entry in `RTK_NATIVE_SUBCOMMANDS`, return the full command string unchanged (e.g. `rtk rewrite "git status"`). Otherwise, strip `rtk` and call `extractSimpleCommands` on the remaining text — identical to the current prefix behavior.
- `extractFromNode` in `extractSimpleCommands` adds a check `if (commandName === 'rtk')` that delegates to `extractFromRtkCommand`, placed before the `PREFIX_COMMANDS` check.
- The new helper receives `(commandLine, node)` — same signature as `extractFromPrefixCommand` — to keep the delegation call-site simple.
- The suffix token text is obtained by extracting the text range from the commandLine using `node.suffix[0].pos` and `node.suffix[0].end`, consistent with the existing `extractTextRange` pattern.

## Testing Decisions

Good tests verify external behavior only — inputs and outputs — not internal structure. They should not assert on which internal functions are called or on intermediate values.

**`helpers/extractFromRtkCommand` (unit, isolation)**
- Tests call `extractFromRtkCommand(commandLine, node)` directly.
- Prior art: `lib/helpers/__tests__/getMatchingGitPattern.js` — same structure, same level of isolation.
- Cases to cover: each native subcommand returns the full `rtk <subcommand> ...` string; an unknown subcommand (e.g. `rtk git status`) strips `rtk` and returns `['git status']`; flags like `--version` and `--help` return the full command.

**`isCommandLineAllowed` (integration, user-facing)**
- Tests call `isCommandLineAllowed(commandLine, allowList)` with a realistic allowList.
- Prior art: `lib/__tests__/isCommandLineAllowed.js` — same structure.
- Cases to cover: `rtk --version` allowed when `rtk --version` is in the allowlist; `rtk --help` allowed when `rtk --help` is in the allowlist; `rtk rewrite <cmd>` allowed when `rtk rewrite` is in the allowlist; `rtk git status` allowed when `git status` is in the allowlist (regression); `rtk --version` rejected when `rtk --version` is NOT in the allowlist.

**`extractSimpleCommands` (already has 2 failing tests)**
- `rtk --version` → `['rtk --version']`
- `rtk --help` → `['rtk --help']`
- These pass once the implementation is complete.

## Out of Scope

- Dynamically discovering RTK native subcommands at runtime (e.g. parsing `rtk --help` output).
- Adding all RTK subcommands to `RTK_NATIVE_SUBCOMMANDS` preemptively — only add when encountered in practice.
- Modifying `allowlist.json` — it already contains the correct entries.
- Changing how `time` is handled — it remains in `PREFIX_COMMANDS` as a pure transparent prefix.

## Further Notes

The `rtk rewrite` entry in `allowlist.json` was previously unreachable: solkan stripped `rtk` and checked `rewrite <cmd>` against the allowlist, which never matched `rtk rewrite`. This PRD fixes that silently as a side effect.
