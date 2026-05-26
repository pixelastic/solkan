import { getCommandLineState } from './getCommandLineState.js';

/**
 * Check if a command line is allowed according to an allow list
 * @param {string} commandLine - The full command line to validate
 * @param {Array<string>} allowList - Array of allowed command patterns
 * @returns {boolean} true if all commands are allowed, false otherwise
 */
export function isCommandLineAllowed(commandLine, allowList) {
  return getCommandLineState(commandLine, allowList).isAllowed;
}
