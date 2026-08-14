## Problem Statement

Solkan currently only validates commands against an allowlist. The preToolUse-Bash hook in oroshi needs to rewrite certain command names (e.g. `rm` → `rm-for-claude`) before validation. The rewrite must be AST-level — only touching actual command invocations, not strings like `echo "rm -rf /"`, comments, or variable names. Today there is no way to do this.

## Solution

Add a `--rewrite-list-file <path>` flag to solkan. When provided, solkan walks the shell AST and replaces matching command names at the token level, then returns the rewritten command string. This runs as an independent phase from allowlist validation — both features can be used together or independently.

## User Stories

1. As a hook author, I want to rewrite `rm` to `rm-for-claude` in a simple command like `rm foo.txt`, so that the safe wrapper is used instead of the raw command.
2. As a hook author, I want rewrites to work in compound commands like `rm foo && echo done`, so that only the `rm` invocation is rewritten while `echo` is untouched.
3. As a hook author, I want rewrites to work inside pipes like `find . | xargs rm`, so that `rm` inside xargs is also rewritten.
4. As a hook author, I want rewrites to work inside `sh -c 'rm foo'`, so that nested shell invocations are also rewritten.
5. As a hook author, I want rewrites to work inside loops like `for f in *.tmp; do rm $f; done`, so that loop bodies are also rewritten.
6. As a hook author, I want rewrites to NOT touch strings like `echo "rm -rf /"`, so that only actual command invocations are rewritten.
7. As a hook author, I want to use `--rewrite-list-file` without `--allow-list-file`, so that I can use solkan purely as a rewriter.
8. As a hook author, I want to use `--allow-list-file` without `--rewrite-list-file`, so that existing validation-only usage still works.
9. As a hook author, I want to use both flags together, so that validation runs on the rewritten command.
10. As a hook author, I want the `rewrite` key to be absent from JSON output when no rewrite actually occurred, so that I can detect whether rewriting happened.
11. As a hook author, I want the `rewrite` key to be absent when `--rewrite-list-file` is not passed, so that the output is clean.
12. As a hook author, I want validation output scoped under an `allow` key, so that the JSON output clearly separates the two features.
13. As a hook author, I want exit code 2 when neither `--rewrite-list-file` nor `--allow-list-file` is passed, so that bad invocations are caught.
14. As a hook author, I want exit code 2 when the rewrite list file is missing or malformed, so that errors are explicit.
15. As a hook author, I want exit code 0 when using rewrite-only mode (no validation), so that the rewriter doesn't block the pipeline.
16. As a hook author, I want rewrites inside rtk wrapper commands like `rtk rm foo`, so that transparent wrappers don't hide commands from rewriting.

## Implementation Decisions

- **Two independent passes:** Rewrite runs first, validation runs second on the rewritten string. Two separate AST walks. Existing validation pipeline is untouched.
- **1:1 single-token rewrite only:** The rewrite map is `Map<string, string>` matching the first token of each simple command. No multi-word keys, no prefix matching, no glob patterns. `{"rm": "rm-for-claude"}` replaces the first token `rm` with `rm-for-claude`.
- **Position-based replacement:** The rewrite walk collects `{start, end, replacement}` spans using AST node positions (`node.name.pos`, `node.name.text.length`), then applies replacements right-to-left on the original string. This preserves all original formatting, quoting, and whitespace.
- **Recursive splicing for sh -c / xargs / rtk:** Same recursive pattern as `extractSimpleCommands`. Inner strings are rewritten independently, then spliced back at their position in the outer string. Quote style is preserved.
- **Exact token match:** `/usr/bin/rm` does not match rewrite key `rm`. Consistent with how allowlist matching works.
- **AST drives the walk, rewrite map is a dumb lookup:** Special commands (sh, xargs, rtk, time) are handled because the AST walk recurses into them — no special rewrite logic for these. If `sh` itself is in the rewrite map, it gets rewritten AND its `-c` content is recursed into (because the AST was parsed before rewriting).
- **Output restructure (breaking change):** The JSON output is now feature-scoped. `rewrite` key (string) present only when a rewrite occurred. `allow` key (object with `isAllowed`, `allowed`, `rejected`) present only when `--allow-list-file`/`--allow-list` is passed. This is a major version bump.
- **Exit codes:** 0 = all allowed (or rewrite-only mode), 1 = some rejected, 2 = usage/input error. Same as today, driven solely by validation phase.
- **New module:** `rewriteCommandLine(commandLine, rewriteMap) → string` — deep module with simple interface, complex internals (AST walk + position tracking + recursive splicing). Tested in isolation.
- **No changes to existing lib modules:** `getCommandLineState`, `extractSimpleCommands`, `getMatchingPattern` — all untouched. The CLI (`bin/solkan`) handles orchestration and output reshaping.

## Testing Decisions

- Test external behavior only — input command + rewrite map → output string.
- The `rewriteCommandLine` module gets its own test file mirroring the structure of `extractSimpleCommands` tests: simple commands, compound commands (&&, ||, pipes), loops, sh -c, xargs, rtk, prefix commands, no-match cases.
- CLI integration tests in `bin/__tests__/solkan.js` cover: rewrite-only output shape, allow-only output shape, combined output shape, exit codes, error cases.
- Prior art: `lib/__tests__/extractSimpleCommands.js` for the unit test style, `bin/__tests__/solkan.js` for CLI integration test style.

## Out of Scope

- Multi-word rewrite keys (e.g. `git push` → `safe-push`). The 1:1 token model covers all current needs.
- Glob patterns in rewrite keys.
- Git global flag stripping for rewrite matching (follows from 1:1 token constraint).
- Rewriting arguments (only command names are rewritten).
- Any changes to the allowlist validation logic itself.

## Further Notes

- This is a breaking change to JSON output format. Consumers of `bin/solkan` (the preToolUse-Bash hook in oroshi) must be updated to read from `allow.isAllowed` instead of `isAllowed`, and `allow.allowed`/`allow.rejected` instead of `commands.allowed`/`commands.rejected`.
- The rewrite map file format is a simple JSON object: `{"rm": "rm-for-claude", "rmdir": "rmdir-for-claude"}`.
