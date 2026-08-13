## Guidance

- Test command: `yarn run test lib/helpers/__tests__/extractCommandLineFromShC.js`
- Lint command: `yarn run lint:fix lib/helpers/extractCommandLineFromShC.js`
- Source: `lib/helpers/extractCommandLineFromShC.js`
- Tests: `lib/helpers/__tests__/extractCommandLineFromShC.js`
- Tests call `extractSimpleCommands` (integration-style), not the helper directly
- The `unbash` parser tokenizes `-ic` as a single suffix entry with `text: '-ic'`
- Prior art: existing tests in the test file show the pattern to follow

## Discoveries
