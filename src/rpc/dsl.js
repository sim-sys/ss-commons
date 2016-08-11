/* @flow */

import type { Result } from '../result/index.js';

import type { UnknownObject } from '../index.js';

import yaml from 'js-yaml';

import {
  Success,
  Failure
} from '../result/index.js';

import type {
  ServiceDefinition,
  Method,
  MethodType,
  Type,
  Prop,
  EnumOption,
  CustomTypeDefinition,
  CustomType,
  UnionType,
  UnionOption
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
    if (knownFields.indexOf(key) === -1) {
      result.push(key);
    }
  }

  return result;
}

export function parseServiceDefinition(
  str: string
): Result<ServiceDefinition, ParseFailure> {
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

  const typesR = parseCustomTypes(obj.types);

  if (!typesR.ok) {
    return typesR;
  }

  const types = typesR.v;

  const unknownFields = validateUnknownFields(obj, [
    'id',
    'name',
    'desc',
    'methods',
    'types'
  ]);

  if (unknownFields.length > 0) {
    return fail(`service definition contains unknown fields: ${unknownFields.join(', ')}`);
  }

  const definition: ServiceDefinition = {
    id,
    name,
    desc,
    types,
    methods
  };

  return Success(definition);
}

function setUnion<T>(sets: Array<Set<T>>): Set<T> {
  const r = new Set();
  sets.forEach(s => {
    s.forEach(v => { r.add(v); });
  });
  return r;
}

export function getCustomTypeDeps(type: Type): Set<CustomType> {
  switch (type.type) {
    case 'String': return new Set([]);
    case 'Number': return new Set([]);
    case 'Boolean': return new Set([]);
    case 'Enum': return new Set([]);
    case 'Custom': return new Set([type]);
    case 'Object': return setUnion(type.props.map(p => getCustomTypeDeps(p.type)));
    case 'Union':
      return setUnion(type.options.map(o => setUnion(o.props.map(p => getCustomTypeDeps(p.type)))));
    default: throw new Error('TODO');
  }
}

function parseCustomTypes(raw: mixed): Result<Array<CustomTypeDefinition>, ParseFailure> {
  if (typeof raw === 'undefined') {
    return Success([]);
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fail('types should be an object');
  }

  const parsedTypes = [];

  const names = Object.keys(raw);

  for (const name of names) {
    const rawType = raw[name];
    const r = parseCustomType(rawType, name);

    if (!r.ok) {
      return r;
    }

    parsedTypes.push(r.v);
  }

  return Success(parsedTypes);
}

function parseCustomType(raw: mixed, name: string): Result<CustomTypeDefinition, ParseFailure> {
  const typeR = parseType(raw);

  if (!typeR.ok) {
    return typeR;
  }

  const type: CustomTypeDefinition = {
    name,
    type: typeR.v
  };

  return Success(type);
}

function parseMethods(raw: mixed): Result<Array<Method>, ParseFailure> {
  if (typeof raw === 'undefined') {
    return fail('service should define methods');
  }

  if (Array.isArray(raw)) {
    return parseMethodsFromArray(raw);
  }

  if (!raw || typeof raw !== 'object') {
    return fail('methods should be array or object');
  }

  return parseMethodsFromObject(raw);
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

function parseMethodsFromObject(raw: UnknownObject): Result<Array<Method>, ParseFailure> {
  const result: Array<Method> = [];

  const names = Object.keys(raw);
  for (const name of names) {
    const val = raw[name];
    const methodR = parseMethod(val, name);

    if (!methodR.ok) {
      return methodR;
    }

    result.push(methodR.v);
  }

  return Success(result);
}

function parseMethod(raw: mixed, defaultName: ?string): Result<Method, ParseFailure> {
  const obj = raw;

  if (!obj || typeof obj !== 'object') {
    return fail('invalid method definition');
  }

  let name = defaultName;

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

  let req;

  if (typeof obj.req === 'undefined') {
    req = { type: 'Object', props: [] };
  } else {
    const reqR = parseType(obj.req);

    if (!reqR.ok) {
      return reqR;
    }

    req = reqR.v;
  }

  let res;

  if (typeof obj.res === 'undefined') {
    res = { type: 'Object', props: [] };
  } else {
    const resR = parseType(obj.res);

    if (!resR.ok) {
      return resR;
    }

    res = resR.v;
  }

  const method: Method = {
    name,
    desc,
    type,
    req,
    res
  };

  return Success(method);
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
    default: return fail(message);
  }
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
    type = 'Object';
  }

  if (typeof type !== 'string') {
    return fail('type should be a string');
  }

  switch (type) {
    case 'String': return Success({ type: 'String' });
    case 'Number': return Success({ type: 'Number' });
    case 'Boolean': return Success({ type: 'Boolean' });
    case 'Enum': return parseEnumType(raw);
    case 'Union': return parseUnionType(raw);
    case 'Object': return parseObjectType(raw);
    default: return Success({ type: 'Custom', ref: type });
  }
}

export function parseObjectType(type: { [key: string]: mixed }): Result<Type, ParseFailure> {
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

  const propsR = parseProps(props);

  if (!propsR.ok) {
    return propsR;
  }

  return Success({
    type: 'Object',
    props: propsR.v
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

export function parseUnionOption(raw: mixed): Result<UnionOption, ParseFailure> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fail('union options should be an object');
  }

  const key = raw.key;

  if (typeof key === 'undefined') {
    return fail('union option should have a key');
  }

  if (typeof key !== 'string') {
    return fail('union option key should be a string');
  }

  if (key.length === 0) {
    return fail('union option key should be non-empty');
  }

  let name = raw.name;

  if (typeof name === 'undefined') {
    name = key;
  }

  if (typeof name !== 'string') {
    return fail('union option name should be a string');
  }

  let desc = raw.desc;

  if (typeof desc === 'undefined') {
    desc = '';
  }

  if (typeof desc !== 'string') {
    return fail('union option desc should be a string');
  }

  let props;

  if (typeof raw.props === 'undefined') {
    props = [];
  } else {
    const propsR = parseProps(raw.props);

    if (!propsR.ok) {
      return propsR;
    }

    props = propsR.v;
  }

  const result: UnionOption = {
    key,
    name,
    desc,
    props
  };

  return Success(result);
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

export function parseUnionType(type: { [key: string]: mixed }): Result<Type, ParseFailure> {
  const key = type.key;

  if (typeof key !== 'string') {
    return fail('union type should define a key');
  }

  if (key.length === 0) {
    return fail('key should not be empty');
  }


  const options = type.options;

  if (typeof options === 'undefined') {
    return fail('enum should define options');
  }

  if (!Array.isArray(options)) {
    return fail('options should be an array');
  }

  // TODO check that key is not used as prop

  const parsedOptions = [];

  for (const option of (options: Array<mixed>)) {
    const optionR = parseUnionOption(option);

    if (!optionR.ok) {
      return optionR;
    }

    parsedOptions.push(optionR.v);
  }

  const result: UnionType = {
    type: 'Union',
    key,
    options: parsedOptions
  };

  return Success(result);
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
    return Success(createDefaultProp(key, typeR.v));
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

  if (typeof optional === 'undefined') {
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

export function parseProps(raw: mixed): Result<Array<Prop>, ParseFailure> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fail('props should be an object'); // TODO array mode
  }

  const keys = Object.keys(raw);

  const parsedProps = [];

  for (const key of keys) {
    const propDesc = raw[key];
    const propR = parseProp(propDesc, key);

    if (!propR.ok) {
      return propR;
    }

    parsedProps.push(propR.v);
  }

  return Success(parsedProps);
}
