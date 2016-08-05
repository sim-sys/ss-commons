/* @flow */

import assert from 'assert';
import {
  generateFlowTypeForType
} from '../codegen.js';

import {
  unindent
} from '../util.js';

import type { Type } from '../types.js';

class CodegenTests {
  testCodegen() {
    const type: Type = {
      type: 'Object',
      props: [
        {
          name: 'foo',
          key: 'foo',
          desc: '',
          optional: false,
          type: { type: 'Number' }
        },
        {
          name: 'bar',
          key: 'bar',
          desc: '',
          optional: true,
          type: { type: 'String' }
        },
        {
          name: 'baz',
          key: 'baz',
          desc: '',
          optional: false,
          type: {
            type: 'Object',
            props: [
              {
                name: 'foo',
                key: 'foo',
                desc: '',
                optional: false,
                type: { type: 'Number' }
              },
              {
                name: 'bar',
                key: 'bar',
                desc: '',
                optional: true,
                type: { type: 'String' }
              }
            ]
          }
        }
      ]
    };

    const code = generateFlowTypeForType(type);

    assert.equal(code, unindent(`
      {
        foo: number,
        bar: ?string,
        baz: {
          foo: number,
          bar: ?string
        }
      }
    `));
  }

  testEmptyObject() {
    assert.equal(generateFlowTypeForType({
      type: 'Object',
      props: []
    }), '{}');
  }
}

export default CodegenTests;
