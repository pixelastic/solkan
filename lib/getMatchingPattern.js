import { getMatchingGenericPattern } from './helpers/getMatchingGenericPattern.js';
import { getMatchingGitPattern } from './helpers/getMatchingGitPattern.js';

/**
 * Returns the first allowlist pattern matching the given simple command,
 * or null if none matches. Delegates to git-aware matching for git commands.
 * @param {string} simpleCommand - The command to check
 * @param {Array<string>} allowList - Allowed patterns
 * @returns {string|null} Matched pattern, or null
 */
export function getMatchingPattern(simpleCommand, allowList) {
  if (simpleCommand.startsWith('git ')) {
    return getMatchingGitPattern(simpleCommand, allowList);
  }
  return getMatchingGenericPattern(simpleCommand, allowList);
}
