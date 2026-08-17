import { _, pMap } from 'golgoth';
import { readJson } from 'firost';

/**
 * Load and concatenate allow-list arrays from one or more JSON files
 * @param {string[]} paths - File paths to read
 * @returns {Promise<string[]>} Concatenated allow list
 */
export async function loadAllowList(paths) {
  const arrays = await pMap(paths, async (filepath) => {
    const data = await readJson(filepath);
    if (!_.isArray(data)) {
      throw new Error(`Expected an array in ${filepath}, got ${typeof data}`);
    }
    return data;
  });
  return _.flatten(arrays);
}
