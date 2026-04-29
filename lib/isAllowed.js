import { _ } from 'golgoth';

/**
 * Check if a simple command is allowed
 * @param {string} simpleCommand - The command to check
 * @param {Array<string>} allowList - Array of allowed patterns
 * @returns {boolean} true if allowed, false otherwise
 */
export function isAllowed(simpleCommand, allowList) {
  return _.some(allowList, (pattern) => {
    // Prefix matching: "echo hello" matches pattern "echo"
    // "git commit" matches pattern "git commit" but NOT "git log"
    return simpleCommand === pattern || simpleCommand.startsWith(pattern + ' ');
  });
}
