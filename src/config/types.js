/* @flow */

// process fields needed for config
export type Process = {
  cwd: () => string,
  argv: Array<string>,
  env: { [key: string]: ?string };
};

export type Parser<T> = {
  parse(val: string): ?T
};
