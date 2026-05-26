import { getMatchingGitPattern } from '../getMatchingGitPattern.js';

describe('getMatchingGitPattern', () => {
  it.each([
    {
      commandLine: 'git -C /some/path status',
      allowList: ['git status'],
      expected: 'git status',
    },
    {
      commandLine: 'git -C /a -C /b status',
      allowList: ['git status'],
      expected: 'git status',
    },
    {
      commandLine: 'git -c core.autocrlf=false status',
      allowList: ['git status'],
      expected: 'git status',
    },
    {
      commandLine: 'git --git-dir=/path/.git status',
      allowList: ['git status'],
      expected: 'git status',
    },
    {
      commandLine: 'git --work-tree=/path status',
      allowList: ['git status'],
      expected: 'git status',
    },
    {
      commandLine: 'git -C /path -c user.email=x status',
      allowList: ['git status'],
      expected: 'git status',
    },
    {
      commandLine: 'git status',
      allowList: ['git status'],
      expected: 'git status',
    },
    {
      commandLine: 'git status --short',
      allowList: ['git status'],
      expected: 'git status',
    },
    {
      commandLine: 'git -C /path',
      allowList: ['git status'],
      expected: null,
    },
    {
      commandLine: 'git -C /path status',
      allowList: ['git log'],
      expected: null,
    },
    {
      commandLine: 'git worktree list',
      allowList: ['git worktree list'],
      expected: 'git worktree list',
    },
    {
      commandLine: 'git worktree list',
      allowList: ['git worktree'],
      expected: 'git worktree',
    },
    {
      commandLine: 'git worktree add /some/path',
      allowList: ['git worktree list'],
      expected: null,
    },
    {
      commandLine: 'git -C /path worktree list',
      allowList: ['git worktree list'],
      expected: 'git worktree list',
    },
  ])('$commandLine', ({ commandLine, allowList, expected }) => {
    expect(getMatchingGitPattern(commandLine, allowList)).toEqual(expected);
  });
});
