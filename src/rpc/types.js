/* @flow */

export type Type =
  | StringType
  | NumberType
  | BooleanType
  | ObjectType
  | EnumType
  | UnionType
  | CustomType
;

export type StringType = {
  type: 'String'
};

export type NumberType = {
  type: 'Number'
};

export type BooleanType = {
  type: 'Boolean'
};

export type Prop = {
  key: string,
  name: string,
  desc: string,
  optional: boolean,
  type: Type
}


export type ObjectType = {
  type: 'Object',
  props: Array<Prop>
};

export type EnumOption = {
  name: string,
  desc: string,
  value: string
};

export type EnumType = {
  type: 'Enum',
  options: Array<EnumOption>
};

export type UnionOption = {
  key: string,
  name: string,
  desc: string,
  props: Array<Prop>
};

export type UnionType = {
  type: 'Union',
  key: string,
  options: Array<UnionOption>
};

export type CustomType = {
  type: 'Custom',
  ref: string
};


export type MethodType =
  | 'Fetch'
  | 'Idempotent'
  | 'Unsafe'
;

export type Method = {
  name: string,
  desc: string,
  type: MethodType,
  req: Type,
  rep: Type
};

export type Schema = {
  id: string,
  name: string,
  desc: string,
  methods: Array<Method>
};
