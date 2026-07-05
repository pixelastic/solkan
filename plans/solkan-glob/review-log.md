## Issue 01 — Glob matching

### isGlob as standalone function vs `__` object

```js
function isGlob(pattern) {
  return pattern.includes('*');
}
```

**Problem:** js-writer style example shows private helpers inside a `__` object for mockability.
**Reason skipped:** `isGlob` is a one-liner pure predicate with no I/O or side effects — it needs no mocking. The `__` pattern is reserved for injectable helpers. Adding it to `__` would be unnecessary indirection.
