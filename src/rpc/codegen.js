/* @flow */

import type {
  Type,
  ObjectType,
  ServiceDefinition,
  UnionType,
  UnionOption,
  EnumType,
  Method
} from './types.js';

import {
  indent,
  unindent
} from './util.js';

const indentationSpaces = 2;

export function generateFlowTypeForType(name: string, type: Type): string {
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
      return generateFlowTypeForUnionType(name, type);
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

    result += generateFlowTypeForType('', prop.type); // TODO this will break unions

    if (i !== type.props.length - 1) {
      result += ',\n';
    }

    result += '';
  }

  return '{\n' + indent(result, indentationSpaces) + '\n}';
}

function objectTypeForUnionOption(key: string, option: UnionOption): Type {
  return {
    type: 'Object',
    props: [
      {
        desc: '',
        key,
        name: key,
        optional: false,
        type: { type: 'StringLiteral', val: option.key }
      }
    ].concat(option.props)
  };
}

export function generateFlowTypeForUnionType(name: string, type: UnionType): string {
  return generateOneLineUnionDef(type.options.map(o => name + o.key));
}

export function generateTypeDef(name: string, type: Type): string {
  let result = '';

  if (type.type === 'Union') {
    for (const option of type.options) {
      const optionTypeName = name + option.key;
      const optionType = objectTypeForUnionOption(type.key, option);
      result += generateTypeDef(optionTypeName, optionType);
      result += '\n\n';
    }
  }

  const typeStr = generateFlowTypeForType(name, type);

  result += `export type ${name} = ${typeStr};`;

  return result;
}

export function generateFlowTypeForEnumType(type: EnumType): string {
  return generateOneLineUnionDef(type.options.map(o => `'${o.value}'`));
}

export function generateOneLineUnionDef(defs: Array<string>): string {
  let result = '';

  for (let i = 0; i < defs.length; i++) {
    result += defs[i];

    if (i !== defs.length - 1) {
      result += ' | ';
    }
  }

  return result;
}

export function generateMethodSignature(method: Method, context: boolean) {
  const nameUppercase = method.name[0].toUpperCase() + method.name.slice(1);
  const requestName = nameUppercase + 'Request';
  const responseName = nameUppercase + 'Response';
  return `${method.name}(request: ${requestName}${context ? ', ctx: Context' : ''}):`
    + ` Promise<RpcResponse<${responseName}, any>>`; // TODO errors
}

export function generateFacade(def: ServiceDefinition, name: string, context: boolean): string {
  let result = '';
  result += `export interface ${name} {\n`;

  // TODO support async methods
  // TODO return result?
  for (const method of def.methods) {
    result += `  ${generateMethodSignature(method, context)};\n`;
  }

  result += '}\n';

  return result;
}

export function generateClientClass(
  def: ServiceDefinition,
  name: string,
  context: boolean
): string {
  let result = '';

  result += unindent(`
    class ${name} {
      _service: RpcService;

      constructor(service: RpcService) {
        this._service = service;
      }
  `);

  result += '\n\n';

  for (const method of def.methods) {
    // TODO response parsing
    result += indent(unindent(`
      async ${generateMethodSignature(method, context)} {
        const req: RpcRequest<{}> = {
          method: '${method.name}',
          type: '${method.type}',
          payload: request
        };
        ${context ? '' : 'const ctx = createEmptyContext();\n'}
        const rep = await this._service.call(req, ctx);
        return rep;
      }
    `), 2);
    result += '\n\n';
  }

  result += '}\n';

  return result;
}

export function generateServiceFile(def: ServiceDefinition): string {
  let result = '';

  result += unindent(`
    /* @flow */
    /* THIS FILE IS GENERATED AUTOMATICALLY, DON'T EDIT! */
    /* eslint-disable */
  `);

  result += '\n\n';

  const commonsPath = 'ss-commons'; // TODO should be configurable

  // imports
  result += unindent(`
    import type {
      RpcRequest,
      RpcResponse,
      RpcService
    } from '${commonsPath}/rpc';

    import {
      createEmptyContext,
      Context
    } from '${commonsPath}/service';
  `);

  result += '\n\n';

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

  result += generateFacade(def, 'ServiceFacade', true);
  result += '\n';

  result += generateFacade(def, 'ContextlessServiceFacade', false);
  result += '\n';

  // client

  result += generateClientClass(def, 'Client', true);
  result += '\n';

  result += unindent(`
    export function createClient(service: RpcService): ServiceFacade {
      return new Client(service);
    }
  `);

  result += '\n\n';

  result += generateClientClass(def, 'ContextlessClient', false);
  result += '\n';

  result += unindent(`
    export function createContextlessClient(service: RpcService): ContextlessServiceFacade {
      return new ContextlessClient(service);
    }
  `);

  result += '\n\n';

  // service

  // TODO parse requests
  result += unindent(`
    class Service {
      _impl: ServiceFacade;

      constructor(impl: ServiceFacade) {
        this._impl = impl;
      }

      call(req: RpcRequest<any>, ctx: Context): Promise<RpcResponse<any, any>> {
        switch (req.method) {
  `);

  result += '\n';

  for (const method of def.methods) {
    result += `      case '${method.name}': return this._impl.${method.name}(req.payload, ctx);\n`;
  }

  result += unindent(`
        }

        throw new Error('TODO');
      }
    }
  `);

  result += '\n\n';

  result += unindent(`
    export function createService(impl: ServiceFacade): RpcService {
      return new Service(impl);
    }
  `);

  return result;
}
