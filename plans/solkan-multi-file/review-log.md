## Issue 01 — loadAllowList
### Shared rich context vs per-test setup
```javascript
beforeEach(() => {
  testDirectory = tmpDirectory('loadAllowList');
});
```
**Problem:** Tests create separate fixtures per test instead of a shared rich context
**Reason skipped:** Error tests need distinct conditions (missing file, bad shape) — a shared context would be awkward and less readable
