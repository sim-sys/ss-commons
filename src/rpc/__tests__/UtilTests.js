/* @Flow */

import {
  indent,
  unindent,
  lineIndentation,
  trimRight,
  indentAllButFirstLine
} from '../util.js';

import assert from 'assert';

class UtilTests {

  testTrimRight() {
    assert.equal(trimRight('   ffoo g\n\t\r'), '   ffoo g');
  }

  testLineIndentation() {
    const r = lineIndentation('   123');
    assert.equal(r, 3);
  }

  testUnindent() {
    const r = unindent(`
      {
        foo: 'bar'
      }
    `);

    const expected = `{
  foo: 'bar'
}`;

    assert.equal(r, expected);
    assert.equal(unindent(`

      {
        foo: 'bar'
      }

      `), expected);
  }

  testUnindentEmptyLines() {
    const r = unindent(`
      {
        foo: 'bar',

        baz: 1
      }
    `);

    const expected = `{
  foo: 'bar',

  baz: 1
}`;

    assert.equal(r, expected);
  }

  testIndent() {
    const str = `{
  a: '213',
  b: true
}`;
    const result = indent(str, 2);

    assert.equal(result, `  {
    a: '213',
    b: true
  }`);
  }

  testIndentAllButFirstLine() {
    const str = `{
  a: '213',
  b: true
}`;
    const result = indentAllButFirstLine(str, 2);

    assert.equal(result, `{
    a: '213',
    b: true
  }`);
  }

  testIndentAllButFirstLineSingleLine() {
    const str = `foo`;
    const result = indentAllButFirstLine(str, 2);

    assert.equal(result, `foo`);
  }
}

export default UtilTests;
