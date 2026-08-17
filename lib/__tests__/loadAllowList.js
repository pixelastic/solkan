import { _ } from 'golgoth';
import { remove, tmpDirectory, writeJson } from 'firost';
import { loadAllowList } from '../loadAllowList.js';

describe('loadAllowList', () => {
  let testDirectory;
  beforeEach(() => {
    testDirectory = tmpDirectory('loadAllowList');
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  it.each([
    {
      title: 'returns the array from a single file',
      files: [['rm', 'ls']],
      expected: ['rm', 'ls'],
    },
    {
      title: 'concatenates arrays from two files in order',
      files: [
        ['rm', 'ls'],
        ['cat', 'echo'],
      ],
      expected: ['rm', 'ls', 'cat', 'echo'],
    },
  ])('$title', async ({ files, expected }) => {
    const paths = await Promise.all(
      _.map(files, async (content, index) => {
        const filepath = `${testDirectory}/${index}.json`;
        await writeJson(content, filepath);
        return filepath;
      }),
    );

    const actual = await loadAllowList(paths);
    expect(actual).toEqual(expected);
  });

  describe('missing file', () => {
    it('throws when a file does not exist', async () => {
      const missing = `${testDirectory}/nope.json`;

      let actual = null;
      try {
        await loadAllowList([missing]);
      } catch (error) {
        actual = error;
      }
      expect(actual).not.toBeNull();
      expect(actual.message).toContain(missing);
    });
  });

  describe('invalid shape', () => {
    it('throws when a file contains an object instead of an array', async () => {
      const filepath = `${testDirectory}/bad.json`;
      await writeJson({ not: 'an array' }, filepath);

      let actual = null;
      try {
        await loadAllowList([filepath]);
      } catch (error) {
        actual = error;
      }
      expect(actual).not.toBeNull();
      expect(actual.message).toContain(filepath);
    });
  });
});
