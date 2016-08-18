/* @flow */

export function catchPromise<T>(promise: Promise<T>): Promise<mixed> {
  return promise.catch((e: mixed) => e);
}

export function convertToError(val: mixed): Error {
  if (val instanceof Error) {
    return val; // TODO flow bug
  }

  return new Error('unknown error');
}
