import { _, pMap } from 'golgoth';
import { readJson } from 'firost';

/**
 * Load and merge rewrite-map objects from one or more JSON files into a Map
 * @param {string[]} paths - File paths to read
 * @returns {Promise<Map<string, string>>} Merged rewrite map
 */
export async function loadRewriteMap(paths) {
  const objects = await pMap(paths, async (filepath) => {
    const data = await readJson(filepath);
    if (!_.isPlainObject(data)) {
      throw new Error(
        `Expected a plain object in ${filepath}, got ${typeof data}`,
      );
    }
    return data;
  });
  const merged = Object.assign({}, ...objects);
  return new Map(_.entries(merged));
}
