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

    const code = generateFlowTypeForType('', type);

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
    assert.equal(generateFlowTypeForType('', {
      type: 'Object',
      props: []
    }), '{}');
  }

  testEnum() {
    assert.equal(generateFlowTypeForType('', {
      type: 'Enum',
      options: [
        {
          value: 'Foo',
          name: '',
          desc: ''
        },
        {
          value: 'Bar',
          name: '',
          desc: ''
        }
      ]
    }), '\'Foo\' | \'Bar\'');
  }

  testUnion() {
    assert.equal(generateFlowTypeForType('Baz', {
      type: 'Union',
      key: 'type',
      options: [
        {
          key: 'Foo',
          name: '',
          desc: '',
          props: []
        },
        {
          key: 'Bar',
          name: '',
          desc: '',
          props: []
        }
      ]
    }), 'BazFoo | BazBar');
  }
}

export default CodegenTests;
