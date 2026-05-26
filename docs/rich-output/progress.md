## Execution order

issue-001 → start here, no blockers
issue-002 → needs issue-001
issue-003 → needs issue-002

## Guidance

- Use `yarn run test <filepath>` to run tests
- Use `yarn run lint:fix` to fix lint issues
- Tests live in `lib/__tests__/` (sibling of the file being tested)
- Follow `it.each` pattern with labeled cases — see existing tests for prior art
- Use named ES6 exports with `.js` extension on local imports
- JSDoc on all exported functions
- `lib/main.js` is the public API barrel — export new modules from there
- Do NOT test `bin/solkan` directly; unit-test `getCommandLineState` instead
- The `__` pattern (private methods object) is used for testable internals — follow it if needed

---
## Log (append below when an issue is completed)
