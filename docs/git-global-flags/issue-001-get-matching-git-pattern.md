## PRD

[git-global-flags/PRD.md](./PRD.md)

## What to build

A new helper `getMatchingGitPattern(simpleCommand, allowList)` that normalizes a git command by stripping global flags before delegating to the standard prefix-match logic.

Normalization algorithm:
1. Discard the leading `git` token.
2. Iterate remaining tokens left-to-right:
   - If the token is a known global flag with a value (`-C`, `-c`, `--git-dir`, `--work-tree`, `--namespace`, `--super-prefix`, `--exec-path`): skip it and the next token.
   - If the token matches `--foo=bar` (contains `=`): skip it.
   - If the token starts with `-` (unknown boolean flag): skip it.
   - Otherwise: this is the subcommand — stop iterating.
3. If a subcommand was found: match `git <subcommand>` against the allowlist using standard prefix-match rules, return the matched pattern or `null`.
4. If no subcommand was found: return `null`.

## Acceptance criteria

- [ ] `git -C /path status` returns the matched pattern `git status` when allowlist contains `git status`
- [ ] `git -C /a -C /b status` (multiple `-C`) returns `git status`
- [ ] `git -c core.autocrlf=false status` returns `git status`
- [ ] `git --git-dir=/path/.git status` (long form with `=`) returns `git status`
- [ ] `git --work-tree=/path status` returns `git status`
- [ ] `git -C /path -c user.email=x status` (combination of flags) returns `git status`
- [ ] `git status` (no global flags) returns `git status`
- [ ] `git status --short` returns `git status` (subcommand flags preserved for prefix match)
- [ ] `git -C /path` (no subcommand) returns `null`
- [ ] allowlist does not contain the subcommand → returns `null`
- [ ] Exhaustive test suite lives in `lib/helpers/__tests__/getMatchingGitPattern.js`

## Blocked by

None — can start immediately
