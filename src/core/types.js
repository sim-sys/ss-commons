/* @flow */

export type Success<T> = {
  success: true,
  val: T
};

export type Failure<E> = {
  success: false,
  err: E
};

export type Result<T, E> =
  | Success<T>
  | Failure<E>
;

export type PResult<T, E> = Promise<Result<T, E>>;
