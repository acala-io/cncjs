// @flow

const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

export function toTitleCase(str: ?string): string {
  if (!str) {
    return '';
  }

  return str.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, (match, index, title) => {
    if (
      index > 0 &&
      index + match.length !== title.length &&
      match.search(smallWords) > -1 &&
      title.charAt(index - 2) !== ':' &&
      (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
      title.charAt(index - 1).search(/[^\s-]/) < 0
    ) {
      return match.toLowerCase();
    }

    if (match.substr(1).search(/[A-Z]|\../) > -1) {
      return match;
    }

    return match.charAt(0).toUpperCase() + match.substr(1);
  });
}

export function toCamelCase(str: ?string): string {
  if (!str) {
    return '';
  }

  const t = str
    .trim()
    .toLowerCase()
    .replace(/[-_\s]+/g, ' ')
    .split(' ')
    .map(s => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`)
    .join('');

  return `${t.substring(0, 1).toLowerCase()}${t.substring(1)}`;
}
