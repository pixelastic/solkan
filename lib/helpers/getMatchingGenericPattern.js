import { _ } from 'golgoth';

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
    if (simpleCommand === pattern) return true;
    if (simpleCommand.startsWith(pattern + ' ')) return true;
    return false;
  });
  return match ?? null;
}
