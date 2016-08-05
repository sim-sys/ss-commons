'use strict';

const yaml = require('js-yaml');

const text = `
name: com.example.service
desc: |
  Bla bla
  bla bla bla
types:
  Foobar:
    id: String
    name: String
methods:
  fetchFoobar:
    type: fetch
    res:
      type: Object

      foo: string
      bar:
        baz: ?string
      bar: List<number
`;

const doc = yaml.safeLoad(text);
console.log(JSON.stringify(doc, null, '  '));
