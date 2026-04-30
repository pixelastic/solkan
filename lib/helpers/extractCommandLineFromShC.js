import { _ } from 'golgoth';

/**
 * Extract command string from sh -c node
 * @param {string} commandLine - The full command line
 * @param {object} node - The sh Command node
 * @returns {string|null} The command string to parse, or null if no -c flag found
 */
export function extractCommandLineFromShC(commandLine, node) {
  const { suffix } = node;
  if (_.isEmpty(suffix)) {
    return null;
  }

  const cFlagIndex = _.findIndex(suffix, { text: '-c' });
  if (cFlagIndex === -1) {
    return null;
  }

  return suffix[cFlagIndex + 1].value;
}
