import { getMatchingGenericPattern } from '../getMatchingGenericPattern.js';

describe('getMatchingGenericPattern', () => {
  it.each([
    {
      title: 'single-word prefix match',
      commandLine: 'echo hello',
      allowList: ['echo'],
      expected: 'echo',
    },
    {
      title: 'multi-word prefix match',
      commandLine: 'git status --short',
      allowList: ['git status'],
      expected: 'git status',
    },
    {
      title: 'longer pattern wins',
      commandLine: 'git status --short',
      allowList: ['git', 'git status'],
      expected: 'git status',
    },
    {
      title: 'returns null when no pattern matches',
      commandLine: 'wget evil.com',
      allowList: ['echo'],
      expected: null,
    },
    {
      title: 'returns null for empty allow list',
      commandLine: 'echo hello',
      allowList: [],
      expected: null,
    },
    {
      title: 'returns null when command matches no pattern prefix',
      commandLine: 'echo',
      allowList: ['echo hello'],
      expected: null,
    },
  ])('$title', ({ commandLine, allowList, expected }) => {
    const actual = getMatchingGenericPattern(commandLine, allowList);
    expect(actual).toBe(expected);
  });
});
