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
  extractText(commandLine, node) {
    return commandLine.substring(node.pos, node.end);
  },
};
