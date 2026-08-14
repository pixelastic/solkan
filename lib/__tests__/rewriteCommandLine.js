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

  describe('sh -c', () => {
    it.each([
      {
        title: 'rewrites inside single-quoted sh -c',
        input: "sh -c 'rm foo'",
        expected: "sh -c 'rm-for-claude foo'",
      },
      {
        title: 'rewrites inside double-quoted bash -c',
        input: 'bash -c "rm foo && echo bar"',
        expected: 'bash -c "rm-for-claude foo && echo bar"',
      },
      {
        title: 'rewrites inside zsh -c',
        input: "zsh -c 'rm foo'",
        expected: "zsh -c 'rm-for-claude foo'",
      },
      {
        title: 'rewrites nested sh -c',
        input: 'sh -c "sh -c \'rm foo\'"',
        expected: 'sh -c "sh -c \'rm-for-claude foo\'"',
      },
      {
        title: 'rewrites sh itself if in rewrite map',
        input: "sh -c 'rm foo'",
        map: new Map([
          ['rm', 'rm-for-claude'],
          ['sh', 'sh-for-claude'],
        ]),
        expected: "sh-for-claude -c 'rm-for-claude foo'",
      },
    ])('$title', ({ input, map, expected }) => {
      const actual = rewriteCommandLine(input, map ?? rewriteMap);
      expect(actual).toEqual(expected);
    });
  });

  describe('xargs', () => {
    it.each([
      {
        title: 'rewrites xargs command',
        input: 'find . | xargs rm',
        expected: 'find . | xargs rm-for-claude',
      },
      {
        title: 'rewrites xargs with flags',
        input: 'find . | xargs -I {} rm {}',
        expected: 'find . | xargs -I {} rm-for-claude {}',
      },
    ])('$title', ({ input, expected }) => {
      const actual = rewriteCommandLine(input, rewriteMap);
      expect(actual).toEqual(expected);
    });
  });

  describe('rtk', () => {
    it.each([
      {
        title: 'rewrites inside rtk wrapper',
        input: 'rtk rm foo',
        expected: 'rtk rm-for-claude foo',
      },
      {
        title: 'does not recurse into rtk native subcommands',
        input: 'rtk config',
        expected: 'rtk config',
      },
    ])('$title', ({ input, expected }) => {
      const actual = rewriteCommandLine(input, rewriteMap);
      expect(actual).toEqual(expected);
    });
  });

  describe('loops', () => {
    it.each([
      {
        title: 'rewrites inside for loop body',
        input: 'for f in *.tmp; do rm $f; done',
        expected: 'for f in *.tmp; do rm-for-claude $f; done',
      },
      {
        title: 'rewrites inside while loop body',
        input: 'while true; do rm foo; done',
        expected: 'while true; do rm-for-claude foo; done',
      },
      {
        title: 'rewrites inside while loop clause',
        input: 'while rm foo; do echo done; done',
        expected: 'while rm-for-claude foo; do echo done; done',
      },
    ])('$title', ({ input, expected }) => {
      const actual = rewriteCommandLine(input, rewriteMap);
      expect(actual).toEqual(expected);
    });
  });

  describe('prefix commands', () => {
    it('rewrites after time', () => {
      const actual = rewriteCommandLine('time rm foo', rewriteMap);
      expect(actual).toEqual('time rm-for-claude foo');
    });
  });
});
