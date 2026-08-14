## Issue 02 — Rewrite recursive cases
### Prefix commands implicit handling
```javascript
// No explicit PREFIX_COMMANDS handling in rewriteCommandLine
```
**Problem:** Spec says "Recurse into the suffixed command" for time, but no explicit recursion exists — time works because unbash models it as a Pipeline annotation.
**Reason skipped:** Adding dead code for a pattern the AST doesn't produce would be worse. If PREFIX_COMMANDS grows, both extractSimpleCommands and rewriteCommandLine need updating together.
