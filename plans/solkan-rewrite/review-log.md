## Issue 02 — Rewrite recursive cases
### Prefix commands implicit handling
```javascript
// No explicit PREFIX_COMMANDS handling in rewriteCommandLine
```
**Problem:** Spec says "Recurse into the suffixed command" for time, but no explicit recursion exists — time works because unbash models it as a Pipeline annotation.
**Reason skipped:** Adding dead code for a pattern the AST doesn't produce would be worse. If PREFIX_COMMANDS grows, both extractSimpleCommands and rewriteCommandLine need updating together.

## Issue 05 — Shared AST walker
### Callback line count exceeds ~20 target
```javascript
walkCommandAST(commandLine, ast.commands, {
  onCommand(node) { ... },
  onShC(node, innerString, argNode) { ... },  // ~15 lines for quote logic
  onXargs(node, innerString, span) { ... },
  onRtk(node, innerString, span) { ... },
});
```
**Problem:** Spec targets "~20 lines of callback definitions" but rewriteCommandLine's callbacks span ~45 lines.
**Reason skipped:** The onShC callback inherently needs quote-preservation and splice logic that can't be compressed without over-abstracting. The "~20" target is aspirational; both callers are still drastically simpler than the original dispatch code.
