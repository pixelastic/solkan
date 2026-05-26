import { _ } from 'golgoth';
import { extractSimpleCommands } from './extractSimpleCommands.js';
import { getMatchingPattern } from './getMatchingPattern.js';

/**
 * Analyzes a command line string against an allow list to determine which commands are permitted or rejected.
 * @param {string} commandLine - The command line string to analyze
 * @param {Array} allowList - Array of allowed command patterns to match against
 * @returns {object} An object containing isAllowed boolean and commands object with allowed and rejected arrays
 */
export function getCommandLineState(commandLine, allowList) {
  const simpleCommands = extractSimpleCommands(commandLine);

  const allAllowed = [];
  const allRejected = [];

  _.each(simpleCommands, (simpleCommand) => {
    const match = getMatchingPattern(simpleCommand, allowList);
    if (match !== null) {
      allAllowed.push(match);
    } else {
      allRejected.push(simpleCommand.split(' ')[0]);
    }
  });

  const allowed = _.uniq(allAllowed);
  const rejected = _.uniq(allRejected);
  const isAllowed = _.isEmpty(rejected);

  return {
    isAllowed,
    commands: {
      allowed,
      rejected,
    },
  };
}
