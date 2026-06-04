## Guidance

This PRD fixes incorrect rejection of `rtk --version`, `rtk --help`, and `rtk rewrite` by the solkan pre-tool-use hook.

**Testing command:** `yarn run test`

**Files to create:**
- `lib/helpers/extractFromRtkCommand.js` — new helper (model after `lib/helpers/getMatchingGitPattern.js`)
- `lib/helpers/__tests__/extractFromRtkCommand.js` — unit tests (model after `lib/helpers/__tests__/getMatchingGitPattern.js`)

**Files to modify:**
- `lib/extractSimpleCommands.js` — remove `rtk` from `PREFIX_COMMANDS`, add `if (commandName === 'rtk')` delegation
- `lib/__tests__/extractSimpleCommands.js` — already has 2 failing tests added (`rtk --version`, `rtk --help`); these pass once Issue 02 is done
- `lib/__tests__/isCommandLineAllowed.js` — add integration tests in Issue 02

**Key prior art:**
- `lib/helpers/getMatchingGitPattern.js` — same helper pattern to follow
- `lib/helpers/__tests__/getMatchingGitPattern.js` — same test structure to follow
- `lib/helpers/extractCommandLineFromXargs.js` — shows how `node.suffix` elements are accessed (`.text || .value` for text, `.pos`/`.end` for positions)

**Conventions:**
- Suffix token text extracted via `commandLine.substring(node.suffix[0].pos, node.suffix[0].end)` (consistent with `extractTextRange`)
- Alternatively check `node.suffix[0].text || node.suffix[0].value` (as done in `extractCommandLineFromXargs`)
- Helper functions use the `__ = { ... }` pattern for internal methods (see `extractSimpleCommands.js`)

**Side effect to be aware of:** `rtk rewrite` in `allowlist.json` was previously unreachable — solkan stripped `rtk` and checked `rewrite <cmd>`, which never matched. This fix makes `rtk rewrite` reachable as a side effect of Issue 02.

## Discoveries

_Append findings here after each issue._
