/* @flow */

/// Success represents a value of typed V, produced
/// by some failure-prone operation
type SuccessT<V> = { ok: true, v: V };

/// Failure represents a failed operation with
/// attached reason of type R.
type FailureT<R> = { ok: false, r: R };

export type Result<V, R> =
  | SuccessT<V>
  | FailureT<R>
;

/// For convenience
export type PResult<V, R> = Promise<Result<V, R>>;

export type Reason = {
  type: string
};


export function Success<V>(v: V): SuccessT<V> {
  return { ok: true, v };
}

export function Failure<R>(r: R): FailureT<R> {
  return { ok: false, r };
}


export function unwrapSuccess<V, R>(result: Result<V, R>): V {
  if (!result.ok) {
    // TODO derive error from R if possible
    throw new Error('Failed to unwrap success');
  }

  return result.v;
}

export function unwrapFailure<V, R>(result: Result<V, R>): R {
  if (result.ok) {
    throw new Error('Failed to unwrap failure');
  }

  return result.r;
}
