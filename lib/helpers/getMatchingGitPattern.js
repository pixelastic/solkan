import { _ } from 'golgoth';
import { parse } from 'unbash';
import { getMatchingGenericPattern } from './getMatchingGenericPattern.js';

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

  return getMatchingGenericPattern(`git ${subcommand}`, allowList);
}

__ = {
  /**
   * Find the first positional token (subcommand) in the suffix array
   * @param {Array<object>} suffix - Suffix nodes from the parsed AST
   * @returns {string|null} The subcommand text, or null if not found
   */
  findSubcommand(suffix) {
    return _.chain(suffix)
      .map((element, i) => {
        const text = element.text || element.value;

        // --foo or -f
        if (text.startsWith('-')) return null;
        // --foo=bar
        if (text.includes('=')) return null;
        // --foo bar
        if (__.isValueOfFlag(suffix[i - 1])) return null;

        return text;
      })
      .compact()
      .join(' ')
      .value();
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
