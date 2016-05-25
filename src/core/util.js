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

export function wrapError(err: mixed): Error {
  if (err instanceof Error) {
    return err;
  }

  if (typeof err === 'string') {
    return new Error(err);
  }

  return new Error('Unknown error');
}

export function Success<T>(val: T): SuccessT<T> {
  return {
    success: true,
    val
  };
}

export function Failure(code: string, info?: ?{}, raw?: mixed): FailureT {
  return {
    success: false,
    code,
    info,
    raw
  };
}

export function errorToFailure(err: mixed): FailureT {
  return Failure('ERROR', null, err);
}


export function unwrapResult<T>(result: Result<T>): T {
  if (result.success) {
    return result.val;
  }

  throw wrapError(result.raw || result.code);
}

export function wrapResult<T>(fn: () => T): Result<T> {
  try {
    return Success(fn());
  } catch (e) {
    return errorToFailure(e);
  }
}

export function wrapResultAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  return fn().then(Success, errorToFailure);
}
