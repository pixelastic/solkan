import { _ } from 'golgoth';
import { parse } from 'unbash';

export let __;

/**
 * Rewrite command names in a command line using AST position-based replacement
 * @param {string} commandLine - The command line to rewrite
 * @param {Map<string, string>} rewriteMap - Map of original command names to replacements
 * @returns {string} The rewritten command line
 */
export function rewriteCommandLine(commandLine, rewriteMap) {
  const ast = parse(commandLine);

  if (!ast.commands.length) {
    return commandLine;
  }

  const replacements = __.collectReplacements(ast.commands, rewriteMap);

  return __.applyReplacements(commandLine, replacements);
}

__ = {
  /**
   * Collect all replacement spans from a list of statements
   * @param {Array<object>} statements - AST statement nodes
   * @param {Map<string, string>} rewriteMap - Map of command name replacements
   * @returns {Array<{start: number, end: number, replacement: string}>} Replacement spans
   */
  collectReplacements(statements, rewriteMap) {
    const replacements = [];
    _.each(statements, (statement) => {
      __.collectFromNode(statement.command, rewriteMap, replacements);
    });
    return replacements;
  },

  /**
   * Collect replacements from a single AST node
   * @param {object} node - The AST node
   * @param {Map<string, string>} rewriteMap - Map of command name replacements
   * @param {Array<{start: number, end: number, replacement: string}>} replacements - Accumulator
   */
  collectFromNode(node, rewriteMap, replacements) {
    const nodeType = node.type;

    // && and || chains
    if (nodeType === 'AndOr' || nodeType === 'Pipeline') {
      _.each(node.commands, (subCommand) => {
        __.collectFromNode(subCommand, rewriteMap, replacements);
      });
      return;
    }

    if (!node.name) {
      return;
    }

    const commandName = node.name.text;
    const replacement = rewriteMap.get(commandName);
    if (replacement) {
      replacements.push({
        start: node.name.pos,
        end: node.name.pos + node.name.text.length,
        replacement,
      });
    }
  },

  /**
   * Apply replacement spans right-to-left to preserve offsets
   * @param {string} commandLine - Original command line
   * @param {Array<{start: number, end: number, replacement: string}>} replacements - Spans to apply
   * @returns {string} The rewritten command line
   */
  applyReplacements(commandLine, replacements) {
    const sorted = [...replacements].sort((a, b) => b.start - a.start);
    return _.reduce(
      sorted,
      (result, { start, end, replacement }) =>
        result.slice(0, start) + replacement + result.slice(end),
      commandLine,
    );
  },
};
