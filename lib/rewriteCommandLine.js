import { _ } from 'golgoth';
import { parse } from 'unbash';
import { walkCommandAST } from './walkCommandAST.js';

export let __;

/**
 * Rewrite command names in a command line using AST position-based replacement
 * @param {string} commandLine - The command line to rewrite
 * @param {Map<string, string>} rewriteList - Map of original command names to replacements
 * @returns {string} The rewritten command line
 */
export function rewriteCommandLine(commandLine, rewriteList) {
  const ast = parse(commandLine);

  if (!ast.commands.length) {
    return commandLine;
  }

  const replacements = [];
  walkCommandAST(commandLine, ast.commands, {
    onCommand(node) {
      __.collectSimpleReplacement(node, rewriteList, replacements);
    },
    onShC(node, innerString, argNode) {
      // Also rewrite the shell command name itself if in rewrite list
      __.collectSimpleReplacement(node, rewriteList, replacements);

      const rewritten = rewriteCommandLine(innerString, rewriteList);
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
    onXargs(node, innerString, span) {
      const rewritten = rewriteCommandLine(innerString, rewriteList);
      if (rewritten === innerString) {
        return;
      }
      replacements.push({
        start: span.start,
        end: span.end,
        replacement: rewritten,
      });
    },
    onRtk(node, innerString, span) {
      const rewritten = rewriteCommandLine(innerString, rewriteList);
      if (rewritten === innerString) {
        return;
      }
      replacements.push({
        start: span.start,
        end: span.end,
        replacement: rewritten,
      });
    },
    onSubstitution() {},
  });

  return __.applyReplacements(commandLine, replacements);
}

__ = {
  /**
   * Collect replacement for a simple command name
   * @param {object} node - The Command AST node
   * @param {Map<string, string>} rewriteList - Map of command name replacements
   * @param {Array<{start: number, end: number, replacement: string}>} replacements - Accumulator
   */
  collectSimpleReplacement(node, rewriteList, replacements) {
    const replacement = rewriteList.get(node.name.text);
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
