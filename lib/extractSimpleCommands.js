import { parse } from 'unbash';

/**
 * Extract all simple commands from a command line
 * @param {string} commandLine - The command line to parse
 * @returns {Array<string>} Array of simple commands
 */
export function extractSimpleCommands(commandLine) {
  const _ast = parse(commandLine);

  // For now, return the input as-is
  // Future: traverse AST to extract all leaf commands
  const simpleCommands = [commandLine];

  return simpleCommands;
}
