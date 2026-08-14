## Guidance

- Testing: `yarn run test <filepath>`
- Linting: `yarn run lint:fix <filepath>`
- Source modules: `lib/`
- Tests: `lib/__tests/` and `bin/__tests__/`
- CLI entry point: `bin/solkan`
- AST parser: `unbash` — `parse(commandLine)` returns AST with `.commands` array
- AST node positions: `node.name.pos` (start), `node.name.text` (command name string), `node.end` (end of full command)
- Prior art for AST walk: `lib/extractSimpleCommands.js` — same node-type dispatch (While, For, AndOr, Pipeline, sh -c, xargs, rtk, time)
- Prior art for tests: `lib/__tests__/extractSimpleCommands.js` (unit), `bin/__tests__/solkan.js` (CLI integration)
- Rewrite map format: `{"rm": "rm-for-claude"}` — simple JSON object, 1:1 single-token replacement
- Position-based replacement: collect `{start, end, replacement}` spans, apply right-to-left
- Recursive splicing: for sh -c / xargs / rtk, rewrite inner string independently, splice back preserving quote style

## Discoveries
