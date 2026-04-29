import { isAllowed } from '../isAllowed.js';

describe('isAllowed', () => {
  it.each([
    { command: 'echo', allowList: ['echo'], expected: true },
    { command: 'wget', allowList: ['echo'], expected: false },
    { command: 'echo hello world', allowList: ['echo'], expected: true },
    {
      command: 'grep foo',
      allowList: ['echo', 'grep', 'git'],
      expected: true,
    },
    { command: 'grep echo', allowList: ['echo'], expected: false },
    { command: 'git commit', allowList: ['git log'], expected: false },
    {
      command: 'git commit -m "test"',
      allowList: ['git commit'],
      expected: true,
    },
    { command: 'echo hello', allowList: [], expected: false },
    { command: '', allowList: ['echo'], expected: false },
  ])('$command with $allowList', ({ command, allowList, expected }) => {
    const actual = isAllowed(command, allowList);
    expect(actual).toBe(expected);
  });
});
