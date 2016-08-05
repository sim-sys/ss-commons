/* @flow */

import assert from 'assert';

import type { Result } from '../../result/index.js';

import {
  unwrapSuccess,
  unwrapFailure
} from '../../result/index.js';

import type {
  Type,
  Prop
} from '../types.js';

import {
  parseType,
  parseProp,
  parseObjectType,
  parseEnumType
} from '../dsl.js';

import type {
  ParseFailure
} from '../dsl.js';

function assertParseSuccess<T>(r: Result<T, ParseFailure>, val: T) {
  if (!r.ok) {
    throw new Error(r.r.message);
  }

  assert.deepEqual(
    r.v,
    val
  );
}

function assertParseFailure<T>(r: Result<T, ParseFailure>, msg: string) {
  assert.equal(
    unwrapFailure(r).message,
    msg
  );
}


class DslTests {
  testParseType() {
    assertParseSuccess(
      parseType('String'),
      { type: 'String' }
    );

    assertParseSuccess(
      parseType('Number'),
      { type: 'Number' }
    );

    assertParseSuccess(
      parseType('Boolean'),
      { type: 'Boolean' }
    );

    assertParseSuccess(
      parseType('Foobar'),
      { type: 'Custom', ref: 'Foobar' }
    );

    assertParseFailure(parseType(1), 'invalid type');
  }

  testParseProp() {
    assertParseSuccess(
      parseProp('String', 'foo'),
      {
        key: 'foo',
        name: 'foo',
        desc: '',
        optional: false,
        type: { type: 'String' }
      }
    );

    assertParseSuccess(
      parseProp({
        type: 'String'
      }, 'foo'),
      {
        key: 'foo',
        name: 'foo',
        desc: '',
        optional: false,
        type: { type: 'String' }
      }
    );

    assertParseSuccess(
      parseProp({
        type: 'String',
        name: 'bar'
      }, 'foo'),
      {
        key: 'foo',
        name: 'bar',
        desc: '',
        optional: false,
        type: { type: 'String' }
      }
    );

    assertParseSuccess(
      parseProp({
        type: 'String',
        desc: 'desc'
      }, 'foo'),
      {
        key: 'foo',
        name: 'foo',
        desc: 'desc',
        optional: false,
        type: { type: 'String' }
      }
    );

    assertParseSuccess(
      parseProp({
        type: 'String',
        optional: true
      }, 'foo'),
      {
        key: 'foo',
        name: 'foo',
        desc: '',
        optional: true,
        type: { type: 'String' }
      }
    );

    assertParseFailure(
      parseProp({
        type: 'String',
        name: {}
      }, 'foo'),
      'name should be a string'
    );

    assertParseFailure(
      parseProp({
        type: 'String',
        desc: {}
      }, 'foo'),
      'desc should be a string'
    );

    assertParseFailure(
      parseProp({
        type: 'String',
        optional: {}
      }, 'foo'),
      'optional should be a boolean'
    );
  }

  testParseObjectType() {
    assertParseSuccess(
      parseObjectType({}),
      {
        type: 'Object',
        props: []
      }
    );

    assertParseSuccess(
      parseObjectType({
        props: {}
      }),
      {
        type: 'Object',
        props: []
      }
    );

    assertParseSuccess(
      parseObjectType({
        props: {
          foo: 'String',
          bar: 'Number'
        }
      }),
      {
        type: 'Object',
        props: [
          {
            key: 'foo',
            name: 'foo',
            optional: false,
            desc: '',
            type: { type: 'String'}
          },
          {
            key: 'bar',
            name: 'bar',
            optional: false,
            desc: '',
            type: { type: 'Number'}
          },
        ]
      }
    );

    assertParseFailure(
      parseObjectType({ props: 123 }),
      'props should be an object'
    );

    assertParseFailure(
      parseObjectType({
        props: {
          foo: 'String',
          bar: 123
        }
      }),
      'invalid type'
    );
  }

  testParseObjectTypeConcise() {
    assertParseSuccess(
      parseObjectType({
        foo: 'String',
        bar: 'Number'
      }),
      {
        type: 'Object',
        props: [
          {
            key: 'foo',
            name: 'foo',
            optional: false,
            desc: '',
            type: { type: 'String'}
          },
          {
            key: 'bar',
            name: 'bar',
            optional: false,
            desc: '',
            type: { type: 'Number'}
          },
        ]
      }
    );
  }

  testParseEnumType() {
    assertParseSuccess(
      parseEnumType(
        {
          type: 'Enum',
          options: [
            {
              key: 'Foo',
              name: 'foo'
            },
            {
              key: 'Bar',
              desc: 'bbb'
            }
          ]
        }
      ),
      {
        type: 'Enum',
        options: [
          {
            value: 'Foo',
            name: 'foo',
            desc: ''
          },
          {
            value: 'Bar',
            name: 'Bar',
            desc: 'bbb'
          }
        ]
      }
    );

    assertParseSuccess(
      parseEnumType(
        {
          type: 'Enum',
          options: [
            'Foo',
            'Bar'
          ]
        }
      ),
      {
        type: 'Enum',
        options: [
          {
            value: 'Foo',
            name: 'Foo',
            desc: ''
          },
          {
            value: 'Bar',
            name: 'Bar',
            desc: ''
          }
        ]
      }
    );
  }

}

export default DslTests;
