/* @flow */

function generateSpaces(n: number): string {
  return Array(n).fill(' ').join('');
}

export function indent(str: string, spaces: number): string {
  const spacesStr = generateSpaces(spaces);

  return str
    .split('\n')
    .map(l => {
      if (l.length === 0) {
        return l;
      } else {
        return spacesStr + l;
      }
    })
    .join('\n');
}

export function indentAllButFirstLine(str: string, spaces: number): string {
  const lines = str.split('\n');

  if (lines.length === 1) {
    return str;
  }

  const firstLine = lines[0];
  const otherLines = lines.slice(1).join('\n');

  return firstLine + '\n' + indent(otherLines, spaces);
}

export function lineIndentation(str: string): number {
  let i = 0;

  while (i < str.length && str[i] === ' ') {
    i++;
  }

  return i;
}

export function trimRight(str: string): string {
  return str.replace(/\s+$/g, '');
}

export function unindent(str: string): string {
  const lines = str
    .split('\n')
    .map(l => trimRight(l));

  let indentation = Infinity;
  let firstNonEmptyLine = 0;
  let lastNonEmptyLine = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length !== 0) {
      indentation = Math.min(indentation, lineIndentation(line));
      lastNonEmptyLine = i;
    } else {
      if (firstNonEmptyLine === i) {
        firstNonEmptyLine = i + 1;
      }
    }
  }

  return lines
    .slice(firstNonEmptyLine, lastNonEmptyLine + 1)
    .map(l => {
      if (l.length !== 0) {
        return l.slice(indentation);
      } else {
        return l;
      }
    }).join('\n');
}
