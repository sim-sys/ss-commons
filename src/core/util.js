/* @flow */

import type {
  Success as SuccessT,
  Failure as FailureT,
  Result
} from '../core/types.js';

import {
  andResult,
  andResultFn
} from './unsafe.js';

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


export function mapResult<T1, T2, E>(
  result: Result<T1, E>,
  fn: (val: T1) => T2
): Result<T2, E> {
  if (result.success) {
    return Success(fn(result.val));
  }

  return Failure(result.err);
}

export function flatMapResult<T1, T2, E1, E2>(
  result: Result<T1, E1>,
  fn: (val: T1) => Result<T2, E2>
): Result<T2, E1 | E2> {
  if (result.success) {
    return fn(result.val);
  }

  return Failure(result.err);
}

export {
  andResult,
  andResultFn
};
