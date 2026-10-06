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

    const prefixLength = part.text.startsWith('$(') ? 2 : 1;
    results.push({
      innerCommandLine: part.text.slice(prefixLength, -1),
      span: { start: word.pos + offset, end: word.pos + cursor },
    });
  });

  return results;
}
