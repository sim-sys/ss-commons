/* @flow */

export function unwrap<T>(val: ?T): T {
  if (!val) {
    throw new Error('Failed to unwrap a value');
  }

  return val;
}
