## Problem Statement

`extractCommandLineFromShC` only matches the exact `-c` flag when extracting inner commands from shell invocations like `zsh -c 'cmd'`. Combined flags like `-ic` (interactive + command) are not recognized, causing the entire shell invocation to be treated as an opaque command. This means `zsh -ic 'git-file-lint'` is blocked even when `git-file-lint` is in the allowlist.

## Solution

Modify the flag lookup in `extractCommandLineFromShC` to recognize `-c` when it appears anywhere within a single-dash combined flag (e.g. `-ic`, `-ci`, `-xc`, `-ixc`). Long-form flags like `--interactive` must not match even though they contain the letter `c`.

## User Stories

1. As a developer, I want `zsh -ic 'git-file-lint'` to extract `git-file-lint` as the inner command, so that my allowlisted command is not blocked
2. As a developer, I want `bash -ic 'echo hello'` to work the same as `bash -c 'echo hello'`, so that interactive shell wrappers don't break allowlisting
3. As a developer, I want `-ci`, `-xc`, `-ixc`, `-icx` and other combined flag orderings to all correctly extract the inner command
4. As a developer, I want `sh --interactive -c 'cmd'` to still work (the existing `-c` exact match handles this)
5. As a developer, I want `sh --interactive 'cmd'` to NOT match as a `-c` invocation, since `--interactive` contains `c` but is a long-form flag

## Implementation Decisions

- Only the `extractCommandLineFromShC` function needs to change
- The matching rule: a suffix token is a combined `-c` flag if it starts with a single `-` (not `--`), and contains the character `c` somewhere after the dash
- When a combined flag is found, the command string is the next suffix token (same as current behavior for standalone `-c`)
- The existing exact `-c` match can be replaced by the new broader logic, since `-c` itself satisfies the "single dash containing c" rule

## Testing Decisions

- Tests go in the existing test file for `extractCommandLineFromShC`
- Tests are integration-style: call `extractSimpleCommands` and check the extracted command list (same pattern as existing tests)
- Good tests cover: `-ic`, `-ci`, `-xc`, `-ixc`, `-icx`, and negative cases like `--interactive` not matching

## Out of Scope

- Changes to other command extraction helpers
- Changes to the allowlist matching logic itself
- Handling of other shell flag behaviors (e.g. `-e`, `-x` without `-c`)

## Further Notes

The `unbash` parser already tokenizes `-ic` as a single suffix entry with `text: '-ic'`. The fix is purely in how we search for the `-c` flag within suffix tokens.
