import { _ } from 'golgoth';

/**
 * Returns the first allowlist pattern matching the given simple command,
 * or null if none matches. Prefix-match rule: exact match or pattern + ' ' prefix.
 * @param {string} simpleCommand - The command to check
 * @param {Array<string>} allowList - Allowed patterns
 * @returns {string|null} Matched pattern, or null
 */
export function getMatchingPattern(simpleCommand, allowList) {
  if (!allowList.length) return null;
  const sorted = _.orderBy(allowList, (p) => p.length, 'desc');
  const match = _.find(sorted, (pattern) => {
    if (simpleCommand === pattern) return true;
    if (simpleCommand.startsWith(pattern + ' ')) return true;
    return false;
  });
  return match ?? null;
}
