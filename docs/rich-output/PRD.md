## Problem Statement

When solkan rejects a command, it exits with code 1 but outputs nothing. The caller has no way to know which specific sub-commands were denied (in a complex pipeline with `&&`, `|`, `bash -c`, etc.) or which allowlist patterns were matched. This makes it impossible to give the user actionable feedback ("add X to your allowlist") or to audit what is being auto-approved ("remove Y from your allowlist").

## Solution

Add a new `getCommandLineState` function that returns a structured result object containing the validation outcome and a split view of all extracted commands — those that matched an allowlist pattern, and those that were rejected. The CLI always prints this object as JSON to stdout before exiting, while preserving the existing exit code contract. `isCommandLineAllowed` becomes a thin wrapper over `getCommandLineState` so all existing integrations continue to work unchanged.

## User Stories

1. As a hook author, I want to read a JSON object from solkan's stdout, so that I can embed the list of denied commands in the permission decision reason shown to the user.
2. As a hook author, I want `commands.rejected` to contain the first word of each denied command, so that I know exactly what to add to my allowlist.
3. As a hook author, I want `commands.allowed` to contain the matched allowlist pattern (not the full command), so that I know exactly which allowlist entry to remove if I want to tighten permissions.
4. As a hook author, I want the JSON to always be present (on both exit 0 and exit 1), so that I can parse stdout unconditionally without branching on the exit code.
5. As a hook author, I want deduplication in both `allowed` and `rejected`, so that a command appearing multiple times in a pipeline is listed only once.
6. As a library consumer, I want `isCommandLineAllowed` to keep returning a boolean, so that existing integrations require no changes.
7. As a library consumer, I want `getCommandLineState` exported from the package, so that I can get the rich result without having to call the CLI.
8. As a library consumer, I want `getMatchingPattern` exported from the package, so that I can check a single simple command against an allowlist and get back the matched pattern.
9. As a CLI user, I want usage errors (missing arguments, unreadable file) to continue printing to stderr and exiting with code 2, so that scripting integrations are not broken by unexpected JSON on stdout.

## Implementation Decisions

- **New module `getMatchingPattern(simpleCommand, allowList)`** — returns the first allowlist pattern that matches the simple command (using the existing prefix-match rule), or `null` if none matches. This is the deep module: it encodes the full matching logic for a single command.

- **`isAllowed` becomes a wrapper** — reimplemented as `getMatchingPattern(simpleCommand, allowList) !== null`. No behavior change; existing tests updated to reflect this.

- **New module `getCommandLineState(commandLine, allowList)`** — extracts all simple commands from the command line (via `extractSimpleCommands`), then for each one calls `getMatchingPattern`. Builds and returns:
  ```
  {
    isAllowed: boolean,          // true iff rejected is empty
    commands: {
      allowed: string[],         // deduplicated matched allowlist patterns
      rejected: string[]         // deduplicated first words of denied commands
    }
  }
  ```

- **`isCommandLineAllowed` becomes a wrapper** — reimplemented as `getCommandLineState(commandLine, allowList).isAllowed`. No behavior change; existing tests updated to reflect this.

- **Both new functions exported from `main.js`** — `getMatchingPattern` and `getCommandLineState` join `isCommandLineAllowed` and `extractSimpleCommands` as public API.

- **CLI outputs JSON unconditionally** — after computing `getCommandLineState`, the CLI calls `console.log(JSON.stringify(state))` then `process.exit(state.isAllowed ? 0 : 1)`. Exit code 2 (usage errors) retains its current stderr-only behavior.

- **Deduplication strategy** — use a `Set` (or lodash `_.uniq`) on the collected patterns/first-words before returning the arrays.

- **`commands.rejected` contains first word only** — extracted by splitting the simple command string on space and taking index 0.

## Testing Decisions

Good tests verify observable behavior through the public interface, not internal implementation. A test should survive a full internal refactor as long as the public contract is unchanged.

### Modules with tests

- **`getMatchingPattern`** — test that it returns the correct allowlist pattern string on a match, `null` on no match, and the specific multi-word pattern when the allowlist contains multi-word entries (e.g. `"git status"` matches `"git status --short"`).

- **`getCommandLineState`** — the primary test surface. Cover: single allowed command (full shape), single rejected command (full shape), mixed pipeline (correct split between `allowed` and `rejected`), deduplication in both arrays, `isAllowed: true` when nothing is rejected, `isAllowed: false` when anything is rejected.

- **`isAllowed`** — existing tests updated to reflect wrapper behavior (outcome unchanged: still boolean).

- **`isCommandLineAllowed`** — existing tests updated to reflect wrapper behavior (outcome unchanged: still boolean).

### Prior art

Existing tests in `lib/__tests__/isCommandLineAllowed.js` and `lib/__tests__/isAllowed.js` use `it.each` with labeled cases — follow the same pattern for new test files.

## Out of Scope

- A `--quiet` / `--silent` flag to suppress JSON output.
- Changes to the allowlist format or matching rules.
- Any changes to how `extractSimpleCommands` parses command lines.
- CLI integration tests (the CLI is a thin wrapper; unit tests on `getCommandLineState` cover the logic).
- Changes to the hook scripts in `.oroshi` (those are a separate concern that will consume the new JSON).

## Further Notes

The asymmetry between `commands.allowed` (allowlist pattern) and `commands.rejected` (first word of command) is intentional and UX-driven: `allowed` answers "which allowlist entry should I remove?", while `rejected` answers "which entry should I add?".
