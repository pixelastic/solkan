import { _ } from 'golgoth';
import { parse } from 'unbash';
import { getMatchingPattern } from '../getMatchingPattern.js';

export let __;

/**
 * Normalizes a git command by stripping global flags, then matches against allowlist
 * @param {string} simpleCommand - The full git command line
 * @param {Array<string>} allowList - Allowed patterns
 * @returns {string|null} Matched pattern, or null
 */
export function getMatchingGitPattern(simpleCommand, allowList) {
  const ast = parse(simpleCommand);
  const node = ast.commands[0]?.command;
  if (!node) return null;

  const subcommand = __.findSubcommand(node.suffix ?? []);
  if (!subcommand) return null;

  return getMatchingPattern(`git ${subcommand}`, allowList);
}

__ = {
  /**
   * Find the first positional token (subcommand) in the suffix array
   * @param {Array<object>} suffix - Suffix nodes from the parsed AST
   * @returns {string|null} The subcommand text, or null if not found
   */
  findSubcommand(suffix) {
    const index = _.findIndex(suffix, (element, i) => {
      const text = element.text || element.value;

      // Skip simple flags (-x, --verbose, …)
      if (text.startsWith('-')) return false;

      // Skip long-form flags with value (--foo=bar)
      if (text.includes('=')) return false;

      // Skip value of other long-form flags (--foo bar)
      if (__.isValueOfFlag(suffix[i - 1])) return false;

      return true;
    });
    return index === -1 ? null : suffix[index].text || suffix[index].value;
  },

  /**
   * Check if a preceding element is a flag that consumes the next token as its value
   * @param {object|undefined} previousElement - The preceding suffix element
   * @returns {boolean} True if current element is consumed as a flag value
   */
  isValueOfFlag(previousElement) {
    const FLAGS_WITH_VALUE = [
      '-C',
      '-c',
      '--git-dir',
      '--work-tree',
      '--namespace',
      '--super-prefix',
      '--exec-path',
    ];

    if (!previousElement) return false;
    const previousText = previousElement.text || previousElement.value;
    return FLAGS_WITH_VALUE.includes(previousText);
  },
};
