## TLDR

Extract a shared AST walker from `extractSimpleCommands` and `rewriteCommandLine` to eliminate the duplicated dispatch logic.

## What to build

Both `extractFromNode` and `collectFromNode` have the same cascade of `if (nodeType === ...)` checks: While, For, ArithmeticFor, AndOr, Pipeline, rtk, xargs, sh -c, simple command. The only difference is what they *do* at each leaf — one collects strings, the other collects replacement spans.

Extract a `walkCommandAST(commandLine, statements, callbacks)` that:

1. Owns all structural recursion: While (clause + body), For/ArithmeticFor (body), AndOr/Pipeline (commands)
2. Owns all inner-string extraction: finding the -c flag for sh -c, skipping xargs flags, checking rtk native subcommands
3. Calls leaf callbacks when it reaches an actionable command

### Callbacks shape

```javascript
const callbacks = {
  // Simple command: "rm -rf foo"
  onCommand(node) {},

  // sh/bash/zsh -c: inner string extracted, quote info provided
  // node = the sh Command node, innerString = "rm foo", argNode = the -c argument AST node
  onShC(node, innerString, argNode) {},

  // xargs: inner command portion extracted
  // node = the xargs Command node, innerString = "rm {}", span = { start, end }
  onXargs(node, innerString, span) {},

  // rtk: wrapped command extracted (not called for native subcommands)
  // node = the rtk Command node, innerString = "rm foo", span = { start, end }
  onRtk(node, innerString, span) {},
};
```

### How the callers use it

**`extractSimpleCommands`**: each callback appends the command text to a results array. For sh -c/xargs/rtk, it recursively calls `extractSimpleCommands` on the inner string.

**`rewriteCommandLine`**: `onCommand` checks the rewrite map and pushes a replacement span. For sh -c/xargs/rtk, it recursively calls `rewriteCommandLine` on the inner string and pushes a splice span.

Both callers remain thin — ~20 lines each of callback definitions. The recursion into inner strings stays in the callers (since extract and rewrite handle it differently), but the AST dispatch and inner-string extraction live in the walker.

### Design constraints

- Adding a new shell (e.g. `fish`) = adding it to `SHELL_COMMANDS`. The walker already handles it.
- Adding a new recursive case (e.g. `env`) = adding one branch in the walker + one callback. Both callers implement the callback.
- The walker reuses existing helpers (`extractCommandLineFromShC`, `extractCommandLineFromXargs`, `extractFromRtkCommand`, `SHELL_COMMANDS`, `RTK_NATIVE_SUBCOMMANDS`)
- Both callers must remain easy to read — the callback pattern should be obvious, not over-abstracted

## Behavioral Tests

No new behavioral tests needed — this is a pure refactor. All existing tests for `extractSimpleCommands` (85 tests) and `rewriteCommandLine` (25 tests) must continue to pass unchanged.

## Scaffolding Tests

None.

## Acceptance criteria

- [ ] A single shared walker handles all AST node-type dispatch
- [ ] Walker handles inner-string extraction for sh -c, xargs, rtk
- [ ] `extractSimpleCommands` and `rewriteCommandLine` use the walker with callbacks
- [ ] Adding a new shell requires changing only `SHELL_COMMANDS`
- [ ] Both callers are ~20 lines of callback definitions, no if/else cascade
- [ ] All 110 existing tests pass without modification
- [ ] No new test files needed (pure refactor)
