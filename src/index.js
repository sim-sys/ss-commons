/* @flow */

function unwrap<T>(val: ?T): T {
  if (val === undefined || val === null) {
    throw new Error('attempted to unwrap empty value');
  }

  return val;
}

export {
  unwrap
};
