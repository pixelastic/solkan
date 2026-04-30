import { _ } from 'golgoth';

export let __;

const FLAGS_WITH_VALUE = [
  '-I',
  '--replace',
  '-n',
  '--max-args',
  '-P',
  '--max-procs',
  '-L',
  '--max-lines',
  '-a',
  '--arg-file',
  '-E',
  '--eof',
  '-s',
  '--max-chars',
  '-d',
  '--delimiter',
];

const FLAGS_WITHOUT_VALUE = [
  '-0',
  '--null',
  '-t',
  '--verbose',
  '-p',
  '--interactive',
  '-r',
  '--no-run-if-empty',
  '-x',
  '--exit',
  '-o',
  '--open-tty',
];

/**
 * Extract command string from xargs node
 * @param {string} commandLine - The full command line
 * @param {object} node - The xargs Command node
 * @returns {string|null} The command string to parse, or null if no command found
 */
export function extractCommandLineFromXargs(commandLine, node) {
  const { suffix } = node;
  const hasSuffix = !_.isEmpty(suffix);
  if (!hasSuffix) {
    return null;
  }

  const firstCommandIndex = __.findFirstCommandIndex(suffix);
  const hasCommand = firstCommandIndex !== -1;
  if (!hasCommand) {
    return null;
  }

  const commandParts = suffix.slice(firstCommandIndex);
  return __.buildCommandString(commandLine, commandParts);
}

__ = {
  /**
   * Find the index of the first element that is not a flag or flag value
   * @param {Array<object>} suffix - Array of suffix elements from the xargs node
   * @returns {number} Index of first command, or -1 if not found
   */
  findFirstCommandIndex(suffix) {
    return _.findIndex(suffix, (element, index) => {
      const text = element.text || element.value;

      const isFlagWithValue = FLAGS_WITH_VALUE.includes(text);
      if (isFlagWithValue) {
        return false;
      }

      const isFlagWithoutValue = FLAGS_WITHOUT_VALUE.includes(text);
      if (isFlagWithoutValue) {
        return false;
      }

      const isUnknownFlag = text.startsWith('-');
      if (isUnknownFlag) {
        return false;
      }

      const isValueOfPreviousFlag = __.isValueOfPreviousFlag(suffix, index);
      if (isValueOfPreviousFlag) {
        return false;
      }

      return true;
    });
  },

  /**
   * Check if current element is the value of a previous flag
   * @param {Array<object>} suffix - Array of suffix elements
   * @param {number} currentIndex - Current element index
   * @returns {boolean} True if current element is a flag value
   */
  isValueOfPreviousFlag(suffix, currentIndex) {
    const previousElement = suffix[currentIndex - 1];
    if (!previousElement) {
      return false;
    }

    const previousText = previousElement.text || previousElement.value;
    return FLAGS_WITH_VALUE.includes(previousText);
  },

  /**
   * Build command string from xargs command parts
   * @param {string} commandLine - The full command line
   * @param {Array<object>} commandParts - The suffix elements representing the command
   * @returns {string} The extracted command string
   */
  buildCommandString(commandLine, commandParts) {
    const firstPart = commandParts[0];
    const isQuotedCommand = commandParts.length === 1 && firstPart.parts;
    if (isQuotedCommand) {
      return firstPart.value;
    }

    const lastPart = commandParts[commandParts.length - 1];
    const startPos = firstPart.pos;
    const endPos = lastPart.end;
    return commandLine.substring(startPos, endPos);
  },
};
