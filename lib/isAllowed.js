import { getMatchingPattern } from './getMatchingPattern.js';

/**
 * Check if a simple command is allowed
 * @param {string} simpleCommand - The command to check
 * @param {Array<string>} allowList - Array of allowed patterns
 * @returns {boolean} true if allowed, false otherwise
 */
export function isAllowed(simpleCommand, allowList) {
  return getMatchingPattern(simpleCommand, allowList) !== null;
}
