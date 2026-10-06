import { _ } from 'golgoth';
import { remove, tmpDirectory, writeJson } from 'firost';
import { loadRewriteList } from '../loadRewriteList.js';

describe('loadRewriteList', () => {
  let testDirectory;
  beforeEach(() => {
    testDirectory = tmpDirectory('loadRewriteList');
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  it.each([
    {
      title: 'returns a Map from a single file',
      files: [{ rm: 'delete', ls: 'list' }],
      expected: new Map([
        ['rm', 'delete'],
        ['ls', 'list'],
      ]),
    },
    {
      title: 'merges two files, later keys override earlier',
      files: [
        { rm: 'delete', ls: 'list' },
        { ls: 'dir', cat: 'type' },
      ],
      expected: new Map([
        ['rm', 'delete'],
        ['ls', 'dir'],
        ['cat', 'type'],
      ]),
    },
  ])('$title', async ({ files, expected }) => {
    const paths = await Promise.all(
      _.map(files, async (content, index) => {
        const filepath = `${testDirectory}/${index}.json`;
        await writeJson(content, filepath);
        return filepath;
      }),
    );

    const actual = await loadRewriteList(paths);
    expect(actual).toEqual(expected);
  });

  describe('missing file', () => {
    it('throws when a file does not exist', async () => {
      const missing = `${testDirectory}/nope.json`;

      let actual = null;
      try {
        await loadRewriteList([missing]);
      } catch (error) {
        actual = error;
      }
      expect(actual).not.toBeNull();
      expect(actual.message).toContain(missing);
    });
  });

  describe('invalid shape', () => {
    it.each([
      {
        title: 'throws when a file contains an array instead of an object',
        content: ['not', 'an', 'object'],
      },
      {
        title: 'throws when a file contains null',
        content: null,
      },
    ])('$title', async ({ content }) => {
      const filepath = `${testDirectory}/bad.json`;
      await writeJson(content, filepath);

      let actual = null;
      try {
        await loadRewriteList([filepath]);
      } catch (error) {
        actual = error;
      }
      expect(actual).not.toBeNull();
      expect(actual.message).toContain(filepath);
    });
  });
});
