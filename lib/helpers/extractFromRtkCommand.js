import { extractSimpleCommands } from '../extractSimpleCommands.js';

// Subcommands and flags where rtk is the real actor, not a transparent wrapper
export const RTK_NATIVE_SUBCOMMANDS = [
  'config',
  'rewrite',
  'trust',
  '--help',
  '--version',
];

export let __;

/**
 * Extract commands from an rtk command node, distinguishing native subcommands from transparent wrappers
 * @param {string} commandLine - The full command line
 * @param {object} node - The AST Command node for the rtk command
 * @returns {Array<string>} Array of simple commands
 */
export function extractFromRtkCommand(commandLine, node) {
  const suffix = node.suffix ?? [];
  const firstToken = __.firstSuffixText(suffix);

  if (!firstToken || RTK_NATIVE_SUBCOMMANDS.includes(firstToken)) {
    return [commandLine.substring(node.name.pos, node.end)];
  }

  return extractSimpleCommands(commandLine.substring(suffix[0].pos, node.end));
}

__ = {
  /**
   * Get the text of the first suffix token
   * @param {Array<object>} suffix - Suffix nodes from the AST
   * @returns {string|null} Text of the first token, or null if suffix is empty
   */
  firstSuffixText(suffix) {
    if (!suffix.length) return null;
    return suffix[0].text || suffix[0].value;
  },
};
