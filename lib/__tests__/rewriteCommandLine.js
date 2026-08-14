import { rewriteCommandLine } from '../rewriteCommandLine.js';

describe('rewriteCommandLine', () => {
  const rewriteMap = new Map([
    ['rm', 'rm-for-claude'],
    ['rmdir', 'rmdir-for-claude'],
  ]);

  describe('simple rewrite', () => {
    it.each([
      {
        title: 'rewrites a matching command name',
        input: 'rm foo',
        expected: 'rm-for-claude foo',
      },
      {
        title: 'rewrites a command with no arguments',
        input: 'rm',
        expected: 'rm-for-claude',
      },
      {
        title: 'rewrites command with flags',
        input: 'rm -rf foo',
        expected: 'rm-for-claude -rf foo',
      },
    ])('$title', ({ input, expected }) => {
      const actual = rewriteCommandLine(input, rewriteMap);
      expect(actual).toEqual(expected);
    });
  });

  describe('no match', () => {
    it.each([
      {
        title: 'returns original when no command matches',
        input: 'echo hello',
        expected: 'echo hello',
      },
      {
        title: 'does not match path-qualified commands',
        input: '/usr/bin/rm foo',
        expected: '/usr/bin/rm foo',
      },
      {
        title: 'returns original with empty rewrite map',
        input: 'rm foo',
        map: new Map(),
        expected: 'rm foo',
      },
    ])('$title', ({ input, map, expected }) => {
      const actual = rewriteCommandLine(input, map ?? rewriteMap);
      expect(actual).toEqual(expected);
    });
  });

  describe('compound commands', () => {
    it.each([
      {
        title: 'rewrites in && chains',
        input: 'rm foo && echo done',
        expected: 'rm-for-claude foo && echo done',
      },
      {
        title: 'rewrites in || chains',
        input: 'rm foo || echo fail',
        expected: 'rm-for-claude foo || echo fail',
      },
      {
        title: 'rewrites in pipes',
        input: 'echo hello | rm foo',
        expected: 'echo hello | rm-for-claude foo',
      },
      {
        title: 'rewrites in semicolon-separated commands',
        input: 'rm foo; echo done',
        expected: 'rm-for-claude foo; echo done',
      },
      {
        title: 'rewrites multiple matching commands',
        input: 'rm foo && rmdir bar',
        expected: 'rm-for-claude foo && rmdir-for-claude bar',
      },
    ])('$title', ({ input, expected }) => {
      const actual = rewriteCommandLine(input, rewriteMap);
      expect(actual).toEqual(expected);
    });
  });

  describe('string safety', () => {
    it('does not rewrite inside echo strings', () => {
      const actual = rewriteCommandLine('echo "rm foo"', rewriteMap);
      expect(actual).toEqual('echo "rm foo"');
    });
  });
});
