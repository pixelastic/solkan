import { _ } from 'golgoth';
import { parse } from 'unbash';
import { SHELL_COMMANDS } from './extractSimpleCommands.js';
import { __ as xargsPrivate } from './helpers/extractCommandLineFromXargs.js';
import { RTK_NATIVE_SUBCOMMANDS } from './helpers/extractFromRtkCommand.js';

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

  const replacements = __.collectReplacements(
    commandLine,
    ast.commands,
    rewriteMap,
  );

  return __.applyReplacements(commandLine, replacements);
}

__ = {
  /**
   * Collect all replacement spans from a list of statements
   * @param {string} commandLine - The full command line
   * @param {Array<object>} statements - AST statement nodes
   * @param {Map<string, string>} rewriteMap - Map of command name replacements
   * @returns {Array<{start: number, end: number, replacement: string}>} Replacement spans
   */
  collectReplacements(commandLine, statements, rewriteMap) {
    const replacements = [];
    _.each(statements, (statement) => {
      __.collectFromNode(
        commandLine,
        statement.command,
        rewriteMap,
        replacements,
      );
    });
    return replacements;
  },

  /**
   * Collect replacements from a single AST node
   * @param {string} commandLine - The full command line
   * @param {object} node - The AST node
   * @param {Map<string, string>} rewriteMap - Map of command name replacements
   * @param {Array<{start: number, end: number, replacement: string}>} replacements - Accumulator
   */
  collectFromNode(commandLine, node, rewriteMap, replacements) {
    const nodeType = node.type;

    // && and || chains, pipes
    if (nodeType === 'AndOr' || nodeType === 'Pipeline') {
      _.each(node.commands, (subCommand) => {
        __.collectFromNode(commandLine, subCommand, rewriteMap, replacements);
      });
      return;
    }

    // while loop: recurse into clause and body
    if (nodeType === 'While') {
      replacements.push(
        ...__.collectReplacements(
          commandLine,
          node.clause.commands,
          rewriteMap,
        ),
      );
      replacements.push(
        ...__.collectReplacements(commandLine, node.body.commands, rewriteMap),
      );
      return;
    }

    // for/ArithmeticFor loop: recurse into body
    if (nodeType === 'For' || nodeType === 'ArithmeticFor') {
      replacements.push(
        ...__.collectReplacements(commandLine, node.body.commands, rewriteMap),
      );
      return;
    }

    if (!node.name) {
      return;
    }

    const commandName = node.name.text;

    // sh/bash/zsh -c: rewrite inner string, splice back preserving quotes
    if (SHELL_COMMANDS.includes(commandName)) {
      __.collectFromShC(commandLine, node, rewriteMap, replacements);
      return;
    }

    // xargs: rewrite the command portion
    if (commandName === 'xargs') {
      __.collectFromXargs(commandLine, node, rewriteMap, replacements);
      return;
    }

    // rtk: rewrite if not native subcommand
    if (commandName === 'rtk') {
      __.collectFromRtk(commandLine, node, rewriteMap, replacements);
      return;
    }

    // Simple command: check rewrite map
    __.collectSimpleReplacement(node, rewriteMap, replacements);
  },

  /**
   * Collect replacement for a simple command name
   * @param {object} node - The Command AST node
   * @param {Map<string, string>} rewriteMap - Map of command name replacements
   * @param {Array<{start: number, end: number, replacement: string}>} replacements - Accumulator
   */
  collectSimpleReplacement(node, rewriteMap, replacements) {
    const replacement = rewriteMap.get(node.name.text);
    if (!replacement) {
      return;
    }
    replacements.push({
      start: node.name.pos,
      end: node.name.pos + node.name.text.length,
      replacement,
    });
  },

  /**
   * Collect replacements from sh/bash/zsh -c command
   * @param {string} commandLine - The full command line
   * @param {object} node - The shell Command AST node
   * @param {Map<string, string>} rewriteMap - Map of command name replacements
   * @param {Array<{start: number, end: number, replacement: string}>} replacements - Accumulator
   */
  collectFromShC(commandLine, node, rewriteMap, replacements) {
    // Also rewrite the shell command name itself if in map
    __.collectSimpleReplacement(node, rewriteMap, replacements);

    const { suffix } = node;
    if (_.isEmpty(suffix)) {
      return;
    }

    const cFlagIndex = _.findIndex(suffix, (entry) => {
      const { text } = entry;
      return (
        text.startsWith('-') && !text.startsWith('--') && text.includes('c')
      );
    });
    if (cFlagIndex === -1 || !suffix[cFlagIndex + 1]) {
      return;
    }

    const argNode = suffix[cFlagIndex + 1];
    const innerString = argNode.value;
    const rewritten = rewriteCommandLine(innerString, rewriteMap);
    if (rewritten === innerString) {
      return;
    }

    // Preserve quote style from the original text
    const quoteChar = argNode.text[0];
    const isQuoted = quoteChar === "'" || quoteChar === '"';
    const newText = isQuoted ? quoteChar + rewritten + quoteChar : rewritten;

    replacements.push({
      start: argNode.pos,
      end: argNode.end,
      replacement: newText,
    });
  },

  /**
   * Collect replacements from xargs command
   * @param {string} commandLine - The full command line
   * @param {object} node - The xargs Command AST node
   * @param {Map<string, string>} rewriteMap - Map of command name replacements
   * @param {Array<{start: number, end: number, replacement: string}>} replacements - Accumulator
   */
  collectFromXargs(commandLine, node, rewriteMap, replacements) {
    const { suffix } = node;
    if (_.isEmpty(suffix)) {
      return;
    }

    const firstCommandIndex = xargsPrivate.findFirstCommandIndex(suffix);
    if (firstCommandIndex === -1) {
      return;
    }

    const commandParts = suffix.slice(firstCommandIndex);
    const startPos = commandParts[0].pos;
    const endPos = commandParts[commandParts.length - 1].end;
    const innerString = commandLine.substring(startPos, endPos);
    const rewritten = rewriteCommandLine(innerString, rewriteMap);
    if (rewritten === innerString) {
      return;
    }

    replacements.push({
      start: startPos,
      end: endPos,
      replacement: rewritten,
    });
  },

  /**
   * Collect replacements from rtk wrapper command
   * @param {string} commandLine - The full command line
   * @param {object} node - The rtk Command AST node
   * @param {Map<string, string>} rewriteMap - Map of command name replacements
   * @param {Array<{start: number, end: number, replacement: string}>} replacements - Accumulator
   */
  collectFromRtk(commandLine, node, rewriteMap, replacements) {
    const suffix = node.suffix ?? [];
    if (!suffix.length) {
      return;
    }

    const firstToken = suffix[0].text || suffix[0].value;
    if (RTK_NATIVE_SUBCOMMANDS.includes(firstToken)) {
      return;
    }

    const startPos = suffix[0].pos;
    const endPos = node.end;
    const innerString = commandLine.substring(startPos, endPos);
    const rewritten = rewriteCommandLine(innerString, rewriteMap);
    if (rewritten === innerString) {
      return;
    }

    replacements.push({
      start: startPos,
      end: endPos,
      replacement: rewritten,
    });
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
