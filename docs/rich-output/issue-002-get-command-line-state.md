## PRD

[rich-output/PRD.md](./PRD.md)

## What to build

Add `getCommandLineState(commandLine, allowList)` — a new deep module that extracts all simple commands from the command line (via `extractSimpleCommands`), then for each one calls `getMatchingPattern`. Returns a structured object:

```
{
  isAllowed: boolean,        // true iff commands.rejected is empty
  commands: {
    allowed: string[],       // deduplicated matched allowlist patterns
    rejected: string[]       // deduplicated first words of denied commands
  }
}
```

`commands.allowed` contains the allowlist pattern that matched (not the full command). `commands.rejected` contains only the first word of each denied command. Both arrays are deduplicated.

Then refactor `isCommandLineAllowed` to be a thin wrapper: `getCommandLineState(commandLine, allowList).isAllowed`. Update its existing tests to assert `.isAllowed` on the result. Export `getCommandLineState` from the package public API.

## Acceptance criteria

- [ ] Single allowed command returns `{ isAllowed: true, commands: { allowed: ['echo'], rejected: [] } }`
- [ ] Single rejected command returns `{ isAllowed: false, commands: { allowed: [], rejected: ['wget'] } }`
- [ ] `commands.allowed` contains the matched allowlist pattern, not the full command string
- [ ] Mixed pipeline (`git status --short | grep foo && wget evil.com` with allowlist `['git status', 'grep']`) returns `allowed: ['git status', 'grep']` and `rejected: ['wget']`
- [ ] Duplicate allowed pattern (same command twice in pipeline) is deduplicated in `commands.allowed`
- [ ] Duplicate rejected command (same command twice in pipeline) is deduplicated in `commands.rejected`
- [ ] `getCommandLineState` is exported from the package public API
- [ ] `isCommandLineAllowed` is reimplemented as a wrapper over `getCommandLineState`
- [ ] All existing `isCommandLineAllowed` tests still pass (assertions updated to check `.isAllowed`)

## Blocked by

- issue-001-get-matching-pattern.md
