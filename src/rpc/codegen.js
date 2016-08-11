/* @flow */

import type {
  Type,
  ObjectType,
  ServiceDefinition,
  UnionType,
  EnumType
} from './types.js';

import {
  indent,
  indentAllButFirstLine,
  unindent
} from './util.js';

const indentationSpaces = 2;

export function generateFlowTypeForType(type: Type): string {
  switch (type.type) {
    case 'String':
      return 'string';
    case 'StringLiteral':
      return `'${type.val}'`;
    case 'Number':
      return 'number';
    case 'Boolean':
      return 'boolean';
    case 'Object':
      return generateFlowTypeForObjectType(type);
    case 'Union':
      return generateFlowTypeForUnionType(type);
    case 'Enum':
      return generateFlowTypeForEnumType(type);
    case 'Custom':
      return type.ref;
    default:
      (null: typeof type);
      throw new Error(`Unknown type ${type.type}`);
  }
}


export function generateFlowTypeForObjectType(type: ObjectType): string {
  if (type.props.length === 0) {
    return '{}';
  }

  let result = '';

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

  return '{\n' + indent(result, indentationSpaces) + '\n}';
}

export function generateFlowTypeForUnionType(type: UnionType): string {
  // TODO we should export each variant separately for convenience
  let result = '';

  // TODO this won't work in props
  for (const option of type.options) {
    const optionType: ObjectType = {
      type: 'Object',
      props: [
        {
          desc: '',
          key: type.key,
          name: type.key,
          optional: false,
          type: { type: 'StringLiteral', val: option.key }
        },
        ...option.props
      ]
    };

    result += '| ' + indentAllButFirstLine(generateFlowTypeForObjectType(optionType), 2) + '\n';
  }

  return '\n' + indent(result, indentationSpaces);
}

export function generateTypeDef(name: string, type: Type): string {
  const typeStr = generateFlowTypeForType(type);

  return `export type ${name} = ${typeStr};`;
}

export function generateFlowTypeForEnumType(type: EnumType): string {
  let result = '';

  for (let i = 0; i < type.options.length; i++) { // TODO pretty top-level style
    const option = type.options[i];
    result += `'${option.value}'`;

    if (i !== type.options.length - 1) {
      result += ' | ';
    }
  }

  return result;
}

export function generateServiceFile(def: ServiceDefinition): string {
  let result = '';

  // TODO all kinds of ignores
  result += '/* @flow */';
  result += '\n\n';

  // imports
  // result += 'import type { RpcResponse } from \'ss-commons/rpc\'\n';
  result += unindent(`
    type RpcResponse<R, E> =
      | {
          success: true,
          result: R
        }
      | {
          success: false,
          error: E
        }
    ;
  `);

  result += '\n';

  result += '// custom types\n';
  result += '\n';

  for (const t of def.types) {
    result += generateTypeDef(t.name, t.type);
    result += '\n\n';
  }

  result += '\n';
  result += '// methods\n';
  result += '\n';

  for (const method of def.methods) {
    result += `// ${method.name}\n`;
    const nameUppercase = method.name[0].toUpperCase() + method.name.slice(1);

    result += generateTypeDef(nameUppercase + 'Request', method.req);
    result += '\n\n';

    result += generateTypeDef(nameUppercase + 'Response', method.res);
    result += '\n\n';

    // TODO errors
  }

  // facade

  result += 'export interface ServiceFacade {\n';

  // TODO support async methods
  // TODO return result?
  for (const method of def.methods) {
    const nameUppercase = method.name[0].toUpperCase() + method.name.slice(1);
    const requestName = nameUppercase + 'Request';
    const responseName = nameUppercase + 'Response';
    result += `  ${method.name}(request: ${requestName}):`
      + ` Promise<RpcResponse<${responseName}, any>>;\n`; // TODO errors
  }

  result += '}';

  return result;
}
