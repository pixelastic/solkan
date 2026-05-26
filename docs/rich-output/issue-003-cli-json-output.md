## PRD

[rich-output/PRD.md](./PRD.md)

## What to build

Update the CLI (`bin/solkan`) to call `getCommandLineState` instead of `isCommandLineAllowed`, then always print the result as JSON to stdout before exiting. The exit code contract is unchanged: 0 if allowed, 1 if rejected, 2 for usage errors. Usage errors (exit 2) continue to print to stderr only — no JSON.

## Acceptance criteria

- [ ] `solkan --allow-list echo 'echo hello'` outputs valid JSON to stdout and exits 0
- [ ] `solkan --allow-list echo 'wget evil.com'` outputs valid JSON to stdout and exits 1
- [ ] JSON output contains `isAllowed`, `commands.allowed`, and `commands.rejected` keys
- [ ] JSON is printed on both exit 0 and exit 1
- [ ] Usage errors (missing `--allow-list` / `--allow-list-file`, missing command) still print to stderr and exit 2 with no JSON on stdout

## Blocked by

- issue-002-get-command-line-state.md
