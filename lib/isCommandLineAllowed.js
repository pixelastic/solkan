import { _ } from 'golgoth';
import { extractSimpleCommands } from './extractSimpleCommands.js';
import { isAllowed } from './isAllowed.js';

/**
 * Check if a command line is allowed according to an allow list
 * @param {string} commandLine - The full command line to validate
 * @param {Array<string>} allowList - Array of allowed command patterns
 * @returns {boolean} true if all commands are allowed, false otherwise
 */
export function isCommandLineAllowed(commandLine, allowList) {
  const simpleCommands = extractSimpleCommands(commandLine);
  return _.every(simpleCommands, (simpleCommand) =>
    isAllowed(simpleCommand, allowList),
  );
}
