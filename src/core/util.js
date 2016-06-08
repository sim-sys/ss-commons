/* @flow */

import type {
  Success as SuccessT,
  Failure as FailureT,
  Result
} from '../core/types.js';

// force-unwrap optional value
export function unwrap<T>(val: ?T): T {
  if (!val) {
    throw new Error('Failed to unwrap a value');
  }

  return val;
}

export function Success<T>(val: T): SuccessT<T> {
  return {
    success: true,
    val
  };
}

export function Failure<E>(err: E): FailureT<E> {
  return {
    success: false,
    err
  };
}


export function unwrapSuccess<T, E>(result: Result<T, E>): T {
  if (!result.success) {
    throw new Error('Failed to unwrap Success');
  }

  return result.val;
}
