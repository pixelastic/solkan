import { getMatchingPattern } from '../getMatchingPattern.js';

describe('getMatchingPattern', () => {
  it.each([
    {
      title: 'returns matched pattern on single-word match',
      command: 'echo hello',
      allowList: ['echo'],
      expected: 'echo',
    },
    {
      title: 'returns matched pattern on multi-word match',
      command: 'git status --short',
      allowList: ['git status'],
      expected: 'git status',
    },
    {
      title: 'returns matched pattern on more precise match',
      command: 'git status --short',
      allowList: ['git', 'git status'],
      expected: 'git status',
    },
    {
      title: 'returns null when no pattern matches',
      command: 'wget evil.com',
      allowList: ['echo'],
      expected: null,
    },
    {
      title: 'returns null for empty allow list',
      command: 'echo hello',
      allowList: [],
      expected: null,
    },
    {
      title: 'delegates git global flags to getMatchingGitPattern',
      command: 'git -C /path status',
      allowList: ['git status'],
      expected: 'git status',
    },
    {
      title: 'non-git command is unaffected by git delegation',
      command: 'echo hello',
      allowList: ['echo hello'],
      expected: 'echo hello',
    },
  ])('$title', ({ command, allowList, expected }) => {
    const actual = getMatchingPattern(command, allowList);
    expect(actual).toBe(expected);
  });
});
