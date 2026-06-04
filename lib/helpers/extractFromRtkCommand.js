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
 * Extract the sub-command string from an rtk command node.
 * Returns null if rtk is the real actor (native subcommand); returns the
 * transparent-wrapper substring otherwise.
 * @param {string} commandLine - The full command line
 * @param {object} node - The AST Command node for the rtk command
 * @returns {string|null} Substring to recurse on, or null if native
 */
export function extractFromRtkCommand(commandLine, node) {
  const suffix = node.suffix ?? [];
  const firstToken = __.firstSuffixText(suffix);

  // If no subcommand, or subdommand is a native one, then there is no rtk
  // subcommand to extract
  if (!firstToken || RTK_NATIVE_SUBCOMMANDS.includes(firstToken)) {
    return null;
  }

  return commandLine.substring(suffix[0].pos, node.end);
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
