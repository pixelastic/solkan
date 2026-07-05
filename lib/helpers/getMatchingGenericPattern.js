import { _ } from 'golgoth';
import { minimatch } from 'minimatch';

export let __;
/**
 * Returns the first allowlist pattern matching the given command via prefix-match,
 * or null if none matches. Longer patterns win over shorter ones.
 * @param {string} simpleCommand - The command to check
 * @param {Array<string>} allowList - Allowed patterns
 * @returns {string|null} Matched pattern, or null
 */
export function getMatchingGenericPattern(simpleCommand, allowList) {
  if (!allowList.length) return null;
  const sorted = _.orderBy(allowList, (p) => p.length, 'desc');
  const match = _.find(sorted, (pattern) => {
    // If key is a glob pattern, we match against the glob
    if (__.isGlob(pattern)) {
      return minimatch(simpleCommand, pattern);
    }

    if (simpleCommand === pattern) return true;
    if (simpleCommand.startsWith(pattern + ' ')) return true;
    return false;
  });
  return match ?? null;
}

__ = {
  /**
   * Determines whether a pattern is a glob pattern.
   * @param {string} pattern - The pattern string to check for glob characters.
   * @returns {boolean} True if the pattern contains a wildcard character, false otherwise.
   */
  isGlob(pattern) {
    return pattern.includes('*');
  },
};
