## Problem Statement

When git is invoked with global flags (e.g. `git -C /some/path status`), solkan fails to recognize the subcommand and rejects the command line, even though the allowlist contains `git status`. The global flags that git accepts before the subcommand are opaque to the current matching logic, which does a plain prefix match against the raw command string.

## Solution

Teach `getMatchingPattern` to handle git commands specially: when the command starts with `git`, extract the first positional argument (the subcommand) by stripping all global flags and their values, then match `git <subcommand>` against the allowlist using the standard prefix-match rule.

## User Stories

1. As a developer, I want `git -C /path/to/repo status` to match the allowlist entry `git status`, so that I can run git in a different directory without being blocked.
2. As a developer, I want `git -c core.autocrlf=false commit` to match `git commit`, so that per-invocation config overrides don't break the allowlist.
3. As a developer, I want `git --git-dir=/path/.git log` to match `git log`, so that explicit repo paths are transparently handled.
4. As a developer, I want `git --work-tree=/path status` to match `git status`, so that explicit work-tree paths are transparently handled.
5. As a developer, I want `git -C /a -C /b status` to match `git status`, so that multiple `-C` flags are all stripped correctly.
6. As a developer, I want `git -C /path -c user.email=x status` to match `git status`, so that combinations of global flags work.
7. As a developer, I want `git status` (no global flags) to still match `git status`, so that the common case is unaffected.
8. As a developer, I want `git status --short` to still match `git status`, so that subcommand flags after the subcommand are preserved for prefix matching.
9. As a developer, I want a git command with no subcommand (e.g. `git -C /path`) to not match any allowlist entry, so that incomplete commands are safely rejected.
10. As a developer, I want non-git commands to be completely unaffected by this change, so that existing allowlist behavior is preserved.

## Implementation Decisions

Three functions, each with a single responsibility:

- **`getMatchingPattern`** (orchestrator) — routes by command type. If `simpleCommand` starts with `"git "`, delegates to `getMatchingGitPattern`. Otherwise delegates to `getMatchingGenericPattern`. Never does matching itself.
- **`getMatchingGitPattern`** (git-specific) — parses the git command via `unbash`, strips global flags to find the subcommand, then calls `getMatchingGenericPattern("git <subcommand>", allowList)`. Calling `getMatchingGenericPattern` (not `getMatchingPattern`) avoids infinite recursion.
- **`getMatchingGenericPattern`** (prefix-match) — the standard matching logic: longest-pattern-first, exact match or `pattern + ' '` prefix. Extracted from the original `getMatchingPattern` body.

`getMatchingGitPattern` normalizes the command by:
  1. Parsing `simpleCommand` with `unbash` and reading the `suffix` array of the first Command node.
  2. Iterating suffix elements. For each element:
     - If it starts with `-`: skip it (covers both boolean flags and flags-with-value).
     - If it contains `=`: skip it (long-form `--foo=bar`).
     - If its preceding element is a known flag-with-value (`-C`, `-c`, `--git-dir`, `--work-tree`, `--namespace`, `--super-prefix`, `--exec-path`): skip it (the value token).
     - Otherwise it is the subcommand — stop.
  3. If a subcommand was found, call `getMatchingGenericPattern("git <subcommand>", allowList)`.
  4. If no subcommand was found, return `null`.

`getMatchingGitPattern` and `getMatchingGenericPattern` live in `lib/helpers/`.

## Testing Decisions

Good tests verify observable behavior (what comes out) given a specific input — they do not test internal state, token counts, or private methods.

**`getMatchingGitPattern` (helper) — exhaustive cases:**
- Single `-C <path>` before subcommand → subcommand matched
- Multiple `-C <path>` flags → subcommand matched
- `-c <name=value>` before subcommand → subcommand matched
- `--git-dir=<path>` (long form with `=`) → subcommand matched
- `--work-tree=<path>` → subcommand matched
- Combination of several global flags → subcommand matched
- No global flags (bare `git status`) → subcommand matched
- Subcommand flags after subcommand preserved (`git status --short` still matches `git status`)
- No subcommand present (only flags) → returns `null`
- Allowlist does not contain the subcommand → returns `null`
- Longer allowlist entry wins over shorter one (e.g. `git status --short` matches `git status --short` not just `git status`)

**`getMatchingPattern` (integration) — happy path only:**
- `git -C /path status` against allowlist `['git status']` → returns `'git status'`

Prior art: `lib/helpers/__tests__/extractCommandLineFromXargs.js` and `lib/helpers/__tests__/extractCommandLineFromShC.js` for the helper test style; `lib/__tests__/getMatchingPattern.js` for the integration test style.

## Out of Scope

- Parsing git subcommand-level flags (flags that appear after the subcommand, e.g. `git commit --amend`). These are already handled correctly by the existing prefix-match logic.
- Supporting any command other than git with this normalization.
- Dynamic discovery of git's global flags. The list is hardcoded.
- Handling `git` invoked without a subcommand as a valid allowlist entry (e.g. allowlist entry `git` matching `git -C /path`).
