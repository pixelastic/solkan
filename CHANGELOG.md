## v0.11.0

[compare changes](https://github.com/pixelastic/solkan/compare/v0.10.0...v0.11.0)

### Features

- **solkan:** Wire --rewrite-list-file flag into CLI ([13c8297](https://github.com/pixelastic/solkan/commit/13c8297))

## v0.10.0

[compare changes](https://github.com/pixelastic/solkan/compare/v0.9.0...v0.10.0)

### Features

- **command-parser:** Support combined shell flags containing -c ([f66e748](https://github.com/pixelastic/solkan/commit/f66e748))

## v0.9.0

[compare changes](https://github.com/pixelastic/solkan/compare/v0.8.0...v0.9.0)

### Features

- **command-parser:** Support combined shell flags containing -c ([cc526c3](https://github.com/pixelastic/solkan/commit/cc526c3))

## v0.8.0

[compare changes](https://github.com/pixelastic/solkan/compare/v0.7.0...v0.8.0)

### Features

- **glob-allowlist:** Support glob patterns in command allowlists ([2d760d5](https://github.com/pixelastic/solkan/commit/2d760d5))

## v0.7.0

[compare changes](https://github.com/pixelastic/solkan/compare/v0.6.2...v0.7.0)

### Features

- **helpers:** Add extractFromRtkCommand to distinguish native rtk subcommands from transparent wrappers ([ca1ba96](https://github.com/pixelastic/solkan/commit/ca1ba96))

## v0.6.2

[compare changes](https://github.com/pixelastic/solkan/compare/v0.6.1...v0.6.2)

fix(git): Fix bug where "git worktree list" wouldn't be matched

## v0.6.1

[compare changes](https://github.com/pixelastic/solkan/compare/v0.6.0...v0.6.1)

## v0.6.0

[compare changes](https://github.com/pixelastic/solkan/compare/v0.5.0...v0.6.0)

### Features

- **lib:** Add getMatchingPattern and refactor isAllowed as thin wrapper ([f1ed931](https://github.com/pixelastic/solkan/commit/f1ed931))
- **lib:** Add getCommandLineState to analyse command lines against an allow list ([28fcd70](https://github.com/pixelastic/solkan/commit/28fcd70))
- **cli:** Output JSON result to stdout instead of exiting silently ([6549253](https://github.com/pixelastic/solkan/commit/6549253))

## v0.5.0

[compare changes](https://github.com/pixelastic/solkan/compare/v0.4.1...v0.5.0)

### Features

- **extractSimpleCommands:** Support `rtk` as a transparent prefix command ([897061f](https://github.com/pixelastic/solkan/commit/897061f))

## v0.4.1

[compare changes](https://github.com/pixelastic/solkan/compare/v0.4.0...v0.4.1)

### Bug Fixes

- **extractSimpleCommands:** Correctly handle env-var-only assignments ([aca0a6c](https://github.com/pixelastic/solkan/commit/aca0a6c))

## v0.4.0

[compare changes](https://github.com/pixelastic/solkan/compare/v0.3.0...v0.4.0)

### Features

- **extractSimpleCommands:** Handle bash -c same as sh/zsh -c ([9bf894f](https://github.com/pixelastic/solkan/commit/9bf894f))

## v0.3.0

[compare changes](https://github.com/pixelastic/solkan/compare/v0.2.2...v0.3.0)

### Features

- **extractSimpleCommands:** Handle zsh -c the same as sh -c ([0d18806](https://github.com/pixelastic/solkan/commit/0d18806))

## v0.2.2

[compare changes](https://github.com/pixelastic/solkan/compare/v0.2.1...v0.2.2)

## v0.2.1

[compare changes](https://github.com/pixelastic/solkan/compare/v0.2.0...v0.2.1)

## v0.2.0

[compare changes](https://github.com/pixelastic/solkan/compare/v0.1.0...v0.2.0)

### Features

- **bin:** Add CLI entry point ([7138310](https://github.com/pixelastic/solkan/commit/7138310))

## v0.1.0


### Features

- **commands:** Add command allowlist validation ([e19a5ca](https://github.com/pixelastic/solkan/commit/e19a5ca))
- **cli:** Add solkan CLI tool for command validation ([d478e8d](https://github.com/pixelastic/solkan/commit/d478e8d))
- **commands:** Add time command prefix support ([10450a0](https://github.com/pixelastic/solkan/commit/10450a0))
- **xargs:** Add xargs command extraction support ([dd3df92](https://github.com/pixelastic/solkan/commit/dd3df92))