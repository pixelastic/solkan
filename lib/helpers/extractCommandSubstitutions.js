import { _ } from 'golgoth';

/**
 * Flatten the parts of a word, descending into double-quoted parts
 * @param {object} word - A word AST node
 * @returns {Array<object>} The leaf parts, in source order
 */
function flattenParts(word) {
  return _.flatMap(word.parts, (part) =>
    part.type === 'DoubleQuoted' ? flattenParts(part) : [part],
  );
}

/**
 * Get the inner command line of a substitution, without its delimiters
 * @param {string} text - The substitution text, as $(…) or `…`
 * @returns {string} The inner command line
 */
function getInnerCommandLine(text) {
  if (text.startsWith('$(')) {
    return text.slice(2, -1);
  }
  // Inside backticks, a backslash escapes only $, ` and \
  return text.slice(1, -1).replace(/\\([$`\\])/g, '$1');
}

/**
 * Find the command substitutions of a word, including double-quoted ones
 * @param {object} word - A word AST node
 * @returns {Array<{innerCommandLine: string, span: {start: number, end: number}}>} Inner command line and span of each substitution
 */
export function extractCommandSubstitutions(word) {
  let cursor = 0;
  const results = [];

  _.each(flattenParts(word), (part) => {
    // unbash gives no position on parts: locate each one after the previous
    const offset = word.text.indexOf(part.text, cursor);
    if (offset === -1) {
      return;
    }
    cursor = offset + part.text.length;

    if (part.type !== 'CommandExpansion') {
      return;
    }

    results.push({
      innerCommandLine: getInnerCommandLine(part.text),
      span: { start: word.pos + offset, end: word.pos + cursor },
    });
  });

  return results;
}
