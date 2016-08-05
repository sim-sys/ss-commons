/* @flow */

import type {
  Type,
  ObjectType,
  Schema
} from './types.js';

import {
  indentAllButFirstLine,
  indent
} from './util.js';

const indentationSpaces = 2;

export function generateFlowTypeForType(type: Type): string {
  switch (type.type) {
    case 'String':
      return 'string';
    case 'Number':
      return 'number';
    case 'Boolean':
      return 'boolean';
    case 'Object':
      return generateFlowTypeForObjectType(type);
    default:
      throw new Error(`Unknown type ${type.type}`);
  }
}


export function generateFlowTypeForObjectType(type: ObjectType): string {
  if (type.props.length === 0) {
    return '{}';
  }

  let result = ''

  for (let i = 0; i < type.props.length; i++) {
    const prop = type.props[i];
    result += prop.key + ': ';

    if (prop.optional) {
      result += '?';
    }

    result += generateFlowTypeForType(prop.type);

    if (i !== type.props.length - 1) {
      result += ',\n';
    }

    result += '';
  }

  return '{\n' + indent(result, 2) + '\n}';
}

export function generateServiceFile(schema: Schema): string {
  let result = '';

  result += '/* @flow */';

  return result;
}
