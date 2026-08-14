## TLDR

Extend `rewriteCommandLine` to handle recursive cases: sh -c, xargs, rtk, loops, and prefix commands.

## What to build

Extend the AST walk in `rewriteCommandLine` to handle the same recursive node types as `extractSimpleCommands`:

- **sh/bash/zsh -c**: Extract inner string via the same logic as `extractCommandLineFromShC`. Recursively rewrite the inner string. Splice the rewritten content back at the `-c` argument's position, preserving the original quote style (use `node.text` to detect quote char, reconstruct with same quotes around rewritten `.value`).
- **xargs**: Extract the command portion via the same logic as `extractCommandLineFromXargs`. Recursively rewrite. Splice back.
- **rtk**: Same pattern as `extractFromRtkCommand` — if the rtk subcommand is not native, extract the wrapped command, recursively rewrite, splice back.
- **Prefix commands (time)**: Recurse into the suffixed command.
- **Loops (for, while, ArithmeticFor)**: Recurse into body (and clause for while).

Each recursive case follows the same pattern: extract inner string + its position span, rewrite recursively, splice back.

## Behavioral Tests

**sh -c**
- rewrites inside single-quoted sh -c: `sh -c 'rm foo'` → `sh -c 'rm-for-claude foo'`
- rewrites inside double-quoted bash -c: `bash -c "rm foo && echo bar"` → `bash -c "rm-for-claude foo && echo bar"`
- rewrites inside zsh -c
- rewrites nested sh -c: `sh -c "sh -c 'rm foo'"` → innermost rm rewritten
- rewrites sh itself if in rewrite map

**xargs**
- rewrites xargs command: `find . | xargs rm` → `find . | xargs rm-for-claude`
- rewrites xargs with flags: `find . | xargs -I {} rm {}` → `find . | xargs -I {} rm-for-claude {}`

**rtk**
- rewrites inside rtk wrapper: `rtk rm foo` → `rtk rm-for-claude foo`
- does not recurse into rtk native subcommands: `rtk config` → unchanged

**Loops**
- rewrites inside for loop body: `for f in *.tmp; do rm $f; done` → `for f in *.tmp; do rm-for-claude $f; done`
- rewrites inside while loop body: `while true; do rm foo; done` → `while true; do rm-for-claude foo; done`
- rewrites inside while loop clause

**Prefix commands**
- rewrites after time: `time rm foo` → `time rm-for-claude foo`

## Acceptance criteria

- [ ] All recursive cases (sh -c, xargs, rtk, loops, time) rewrite correctly
- [ ] Quote style preserved when splicing back into sh -c arguments
- [ ] Nested recursion works (sh -c inside sh -c)
- [ ] All behavioral tests pass
