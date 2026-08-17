## Guidance

- Test command: `yarn run test <filepath>`
- Lint command: `yarn run lint:fix <filepath>`
- Source lives at `/home/tim/local/www/projects/solkan/` (worktree at `/home/tim/local/www/worktrees/solkan--solkan-multi-file/`)
- New helpers go in `lib/loadAllowList.js` and `lib/loadRewriteMap.js`
- Tests go in `lib/__tests__/loadAllowList.js` and `lib/__tests__/loadRewriteMap.js`
- Use `import { _ } from 'golgoth'` for lodash
- Use `import { readJson } from 'firost'` for file reading
- Test pattern: `describe`/`it.each` with `{ title, input, expected }` objects (see `lib/__tests__/rewriteCommandLine.js`)
- Tests write temp JSON files via `fs` or `firost`, pass paths to helpers
- Use `/js-writer` skill for implementation
- Use `/tdd` skill for test-driven development

## Discoveries
