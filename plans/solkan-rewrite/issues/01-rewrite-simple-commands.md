## TLDR

Add `rewriteCommandLine(commandLine, rewriteMap)` that rewrites command names in simple and compound commands via AST position-based replacement.

## What to build

New module `lib/rewriteCommandLine.js` exporting `rewriteCommandLine(commandLine, rewriteMap) → string`.

Walk the AST (via `unbash.parse`) using the same node-type dispatch as `extractSimpleCommands`. For each simple command node, check `node.name.text` against the rewrite map (`Map.get`). If it matches, record `{start: node.name.pos, end: node.name.pos + node.name.text.length, replacement}`.

After walking, apply replacements right-to-left (highest offset first) on the original string to preserve positions.

This issue covers only top-level and compound commands (&&, ||, pipes, ;). Recursive cases (sh -c, xargs, rtk, loops, prefix commands) are handled in issue 02.

Return the original string unchanged when no matches are found.

Export the module from `lib/main.js`.

## Behavioral Tests

**Simple rewrite**
- rewrites a matching command name: `rm foo` → `rm-for-claude foo`
- rewrites a command with no arguments: `rm` → `rm-for-claude`
- rewrites command with flags: `rm -rf foo` → `rm-for-claude -rf foo`

**No match**
- returns original string when no command matches: `echo hello` → `echo hello`
- does not match path-qualified commands: `/usr/bin/rm foo` → `/usr/bin/rm foo`
- returns original string with empty rewrite map

**Compound commands**
- rewrites in && chains: `rm foo && echo done` → `rm-for-claude foo && echo done`
- rewrites in || chains: `rm foo || echo fail` → `rm-for-claude foo || echo fail`
- rewrites in pipes: `echo hello | rm foo` → `echo hello | rm-for-claude foo`
- rewrites in semicolon-separated commands: `rm foo; echo done` → `rm-for-claude foo; echo done`
- rewrites multiple matching commands: `rm foo && rmdir bar` → `rm-for-claude foo && rmdir-for-claude bar`

**String safety**
- does not rewrite inside echo strings (AST only parses command invocations, not string content)

## Acceptance criteria

- [ ] `rewriteCommandLine` exported from `lib/main.js`
- [ ] Position-based replacement preserves original formatting and whitespace
- [ ] Replacements applied right-to-left to preserve offsets
- [ ] All behavioral tests pass
