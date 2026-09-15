import { _ } from 'golgoth';
import { parse } from 'unbash';
import { SHELL_COMMANDS, walkCommandAST } from './walkCommandAST.js';

// Re-export for external consumers
export { SHELL_COMMANDS };

// Transparent prefix commands stripped before analyzing the real command
export const PREFIX_COMMANDS = ['time'];

// Shell builtins that are always allowed and filtered from results
export const SHELL_BUILTINS = ['break', 'continue', 'true', 'false', 'return'];

/**
 * Extract all simple commands from a command line
 * @param {string} commandLine - The command line to parse
 * @returns {Array<string>} Array of simple commands
 */
export function extractSimpleCommands(commandLine) {
  const ast = parse(commandLine);

  if (!ast.commands.length) {
    return [commandLine];
  }

  const results = [];
  walkCommandAST(commandLine, ast.commands, {
    onCommand(node) {
      const commandName = node.name.text;
      // Shell builtins are always allowed — skip them
      if (SHELL_BUILTINS.includes(commandName)) {
        return;
      }
      // time echo hello → recurse on suffix
      if (PREFIX_COMMANDS.includes(commandName)) {
        results.push(
          ...extractSimpleCommands(
            commandLine.substring(node.suffix[0].pos, node.end),
          ),
        );
        return;
      }
      results.push(commandLine.substring(node.name.pos, node.end));
    },
    onShC(node, innerString) {
      results.push(...extractSimpleCommands(innerString));
    },
    onXargs(node, innerString) {
      results.push(...extractSimpleCommands(innerString));
    },
    onRtk(node, innerString) {
      results.push(...extractSimpleCommands(innerString));
    },
  });

  return _.filter(results, (cmd) => !cmd.startsWith('['));
}
