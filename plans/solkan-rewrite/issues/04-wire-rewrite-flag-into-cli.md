## TLDR

Parse `--rewrite-list-file`, run rewrite before validation, add `rewrite` key to JSON output.

## What to build

Wire the rewrite module into the CLI (`bin/solkan`):

1. Parse `--rewrite-list-file <path>` via minimist
2. Load and validate the JSON file (must be a flat object with string values). Exit 2 on missing/malformed file.
3. If rewrite map provided: call `rewriteCommandLine(commandLine, rewriteMap)`. If result differs from input, add `rewrite` key to output.
4. If allow list provided: call `getCommandLineState` on the (possibly rewritten) command. Add `allow` key to output.
5. Exit code: 0 if no validation or all allowed, 1 if some rejected, 2 for errors.

Output examples:

Rewrite only (rewrite occurred):
```json
{"rewrite": "rm-for-claude foo"}
```

Rewrite only (no match):
```json
{}
```

Allow only:
```json
{"allow": {"isAllowed": true, "allowed": ["echo"], "rejected": []}}
```

Both (rewrite occurred):
```json
{"rewrite": "rm-for-claude foo", "allow": {"isAllowed": true, "allowed": ["rm-for-claude"], "rejected": []}}
```

## Behavioral Tests

**Rewrite-only mode**
- outputs `rewrite` key when rewrite occurred, exit 0
- outputs empty object when no rewrite occurred, exit 0
- no `allow` key in output

**Allow-only mode**
- outputs `allow` key, no `rewrite` key (backwards compat with issue 03)

**Combined mode**
- validation runs on rewritten command
- both `rewrite` and `allow` keys present when rewrite occurred
- only `allow` key when no rewrite match

**Error handling**
- exit 2 for missing rewrite file
- exit 2 for malformed JSON in rewrite file
- exit 2 for non-object rewrite file (array, string, etc.)

**Exit codes**
- exit 0 for rewrite-only mode
- exit 0 when validation passes
- exit 1 when validation rejects

## Acceptance criteria

- [ ] `--rewrite-list-file` parsed and validated
- [ ] Rewrite runs before validation
- [ ] `rewrite` key present only when rewrite occurred
- [ ] `rewrite` key absent when flag not passed
- [ ] Validation runs on rewritten command when both flags present
- [ ] All error cases produce exit 2
- [ ] All behavioral tests pass
