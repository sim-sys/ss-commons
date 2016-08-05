/* @flow */

import type { Result } from '../result/index.js';

import type { UnknownObject } from '../index.js';

import yaml from 'js-yaml';

import {
  Success,
  Failure
} from '../result/index.js';

import type {
  Schema,
  Method,
  MethodType,
  Type,
  Prop,
  EnumOption
} from './types.js';

export type ParseFailure = {
  message: string
};

function fail(message: string) {
  return Failure({ message });
}

function validateUnknownFields(obj: UnknownObject, knownFields: Array<string>): Array<string> {
  const keys = Object.keys(obj);
  const result = [];

  for (const key of keys) {
    if (!knownFields.includes(key)) {
      result.push(key);
    }
  }

  return result;
}

export function parseServiceDefinition(str: string, filename: string): Result<Schema, ParseFailure> {
  let raw;

  try {
    raw = yaml.safeLoad(str);
  } catch (e) {
    return fail('definition is not valid YAML');
  }

  const obj: mixed = raw;

  if (!obj || typeof obj !== 'object') {
    return fail('invalid service definition');
  }

  const id = obj.id;

  if (typeof id === 'undefined') {
    return fail('service should have an id');
  }

  if (typeof id !== 'string') {
    return fail('service id should be a string');
  }

  if (id.length === 0) {
    return fail('service id should be non-empty');
  }

  const name = obj.name;

  if (typeof name !== 'string') {
    return fail('service name should be a string');
  }

  if (name.length === 0) {
    return fail('service name should be non-empty');
  }

  let desc = obj.desc;

  if (typeof desc !== 'undefined') {
    if (typeof desc !== 'string') {
      return fail('service description should be a string');
    }
  } else {
    desc = '';
  }

  const methodsR = parseMethods(obj.methods);

  if (!methodsR.ok) {
    return methodsR;
  }

  const methods = methodsR.v;

  const unknownFields = validateUnknownFields(obj, [
    'id',
    'name',
    'desc',
    'methods'
  ]);

  if (unknownFields.length > 0) {
    return fail(`service definition contains unknown fields: ${unknownFields.join(', ')}`);
  }

  const schema: Schema = {
    id,
    name,
    desc,
    methods
  };

  return Success(schema);
}

function parseMethods(raw: mixed): Result<Array<Method>, ParseFailure> {
  if (typeof raw === 'undefined') {
    return fail('service should define methods')
  }

  if (Array.isArray(raw)) {
    return parseMethodsFromArray(raw);
  }


  return fail('TODO');
}

function parseMethodsFromArray(raw: Array<mixed>): Result<Array<Method>, ParseFailure> {
  const result: Array<Method> = [];

  for (const val of raw) {
    const methodR = parseMethod(val, null);

    if (!methodR.ok) {
      return methodR;
    }

    result.push(methodR.v);
  }

  return Success(result);
}

function parseMethod(raw: mixed, name: ?string): Result<Method, ParseFailure> {
  const obj = raw;

  if (!obj || typeof obj !== 'object') {
    return fail('invalid method definition');
  }

  if (!name) {
    const tempName = obj.name;

    if (typeof tempName === 'undefined') {
      return fail('methods should have `name` field');
    }

    if (typeof tempName !== 'string') {
      return fail('method name should be a string');
    }

    name = tempName;
  } else {
    const tempName = obj.name;

    if (typeof tempName !== 'undefined') {
      return fail('methods should not have name field in dictionary mode');
    }
  }

  if (name.length === 0) {
    return fail('method name should be non-empty');
  }

  let desc = obj.desc;

  if (typeof desc !== 'undefined') {
    if (typeof desc !== 'string') {
      return fail('method desc should be a string');
    }
  } else {
    desc = '';
  }

  const typeR = parseMethodType(obj.type);

  if (!typeR.ok) {
    return typeR;
  }

  const type = typeR.v;

  const reqR = parseType(obj.req);

  if (!reqR.ok) {
    return reqR;
  }

  const req = reqR.v;

  const repR = parseType(obj.rep);

  if (!repR.ok) {
    return repR;
  }

  const rep = repR.v;

  const method: Method = {
    name,
    desc,
    type,
    req,
    rep
  };

  return fail('');
}

function parseMethodType(raw: mixed): Result<MethodType, ParseFailure> {
  const message = 'method type should be one of `fetch`, `idempotent` or `unsafe`';

  if (typeof raw !== 'string') {
    return fail(message);
  }

  switch (raw.toLowerCase()) {
    case 'fetch': return Success('Fetch');
    case 'idempotent': return Success('Idempotent');
    case 'unsafe': return Success('Unsafe');
  }

  return fail(message);
}

export function parseType(raw: mixed): Result<Type, ParseFailure> {
  if (typeof raw === 'string') {
    switch (raw) {
      case 'String': return Success({ type: 'String' });
      case 'Number': return Success({ type: 'Number' });
      case 'Boolean': return Success({ type: 'Boolean' });
      default: return Success({ type: 'Custom', ref: raw });
    }
  }

  if (!raw || typeof raw !== 'object') {
    return fail('invalid type');
  }

  let type = raw.type;

  if (typeof type === 'undefined') {
    type === 'Object';
  }

  if (typeof type !== 'string') {
    return fail('type should be a string');
  }

  switch (type) {
    case 'String': return Success({ type: 'String' });
    case 'Number': return Success({ type: 'Number' });
    case 'Boolean': return Success({ type: 'Boolean' });
    case 'Enum': return parseEnumType(raw);
    // TODO union
    case 'Object': return parseObjectType(raw);
  }

  return Success({ type: 'Custom', ref: type })
}

export function parseObjectType(type: { [key: string]: mixed }):  Result<Type, ParseFailure> {
  let props = type.props;

  if (typeof props === 'undefined') {
    if (typeof type.type === 'undefined') {
      props = type;
    } else {
      return Success({
        type: 'Object',
        props: []
      });
    }
  }

  if (!props || typeof props !== 'object' || Array.isArray(props)) {
    return fail('props should be an object'); // TODO array mode
  }

  const keys = Object.keys(props);

  const parsedProps = [];

  for (const key of keys) {
    const propDesc = props[key];
    const propR = parseProp(propDesc, key);

    if (!propR.ok) {
      return propR;
    }

    parsedProps.push(propR.v);
  }


  return Success({
    type: 'Object',
    props: parsedProps
  });
}

export function parseEnumOption(raw: mixed): Result<EnumOption, ParseFailure> {
  if (typeof raw === 'string') {
    return Success({
      value: raw,
      name: raw,
      desc: '',
    });
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fail('enum options should be an object');
  }

  const key = raw.key;

  if (typeof key === 'undefined') {
    return fail('enum option should have a key');
  }

  if (typeof key !== 'string') {
    return fail('enum option key should be a string');
  }

  if (key.length === 0) {
    return fail('enum option key should be non-empty');
  }

  let name = raw.name;

  if (typeof name === 'undefined') {
    name = key;
  }

  if (typeof name !== 'string') {
    return fail('enum option name should be a string');
  }

  let desc = raw.desc;

  if (typeof desc === 'undefined') {
    desc = '';
  }

  if (typeof desc !== 'string') {
    return fail('enum option desc should be a string');
  }

  return Success({
    value: key,
    name,
    desc,
  });
}

export function parseEnumType(type: { [key: string]: mixed }): Result<Type, ParseFailure> {
  const options = type.options;

  if (typeof options === 'undefined') {
    return fail('enum should define options');
  }

  if (!Array.isArray(options)) {
    return fail('options should be an array');
  }

  const parsedOptions = [];

  for (const option of (options: Array<mixed>)) {
    const optionR = parseEnumOption(option);

    if (!optionR.ok) {
      return optionR;
    }

    parsedOptions.push(optionR.v);
  }

  return Success({
    type: 'Enum',
    options: parsedOptions
  });
}


function createDefaultProp(key: string, type: Type): Prop {
  return {
    key,
    name: key,
    desc: '',
    optional: false,
    type
  };
}

export function parseProp(raw: mixed, key: string): Result<Prop, ParseFailure> {
  const typeR = parseType(raw);

  if (!typeR.ok) {
    return typeR;
  }

  const type = typeR.v;

  if (typeof raw === 'string') {
    return Success(createDefaultProp(key, typeR.v))
  }

  if (!raw || typeof raw !== 'object') {
    return fail('invalid prop');
  }


  let name = raw.name;

  if (typeof name === 'undefined') {
    name = key;
  } else if (typeof name !== 'string') {
    return fail('name should be a string');
  }

  let desc = raw.desc;

  if (typeof desc === 'undefined') {
    desc = '';
  } else if (typeof desc !== 'string') {
    return fail('desc should be a string');
  }

  let optional = raw.optional;

  if (typeof  optional === 'undefined') {
    optional = false;
  } else if (typeof optional !== 'boolean') {
    return fail('optional should be a boolean');
  }

  return Success({
    key,
    name,
    desc,
    optional,
    type
  });
}
