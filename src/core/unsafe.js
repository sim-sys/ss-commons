/* @flow */

import type {
  Result
} from './types.js';

type AnyResult = Result<any, any>;
type AnyArrayResult = Result<Array<any>, any>;
type ResultFn<T, E> = () => Result<T, E>;
type AnyResultFn = ResultFn<any, any>;

function andResult(...results: Array<AnyResult>): AnyArrayResult {
  const vals = [];

  for (const result of results) {
    if (result.success) {
      vals.push(result.val);
    } else {
      return result;
    }
  }

  return {
    success: true,
    val: vals
  };
}

function andResultFn(...resultFns: Array<AnyResultFn>): AnyResult {
  const vals = [];

  for (const resultFn of resultFns) {
    const result = resultFn();
    if (result.success) {
      vals.push(result.val);
    } else {
      return result;
    }
  }

  return {
    success: true,
    val: vals
  };
}

function orResult(...results: Array<AnyResult>): AnyResult {
  const vals = [];
  let err;

  for (const result of results) {
    if (result.success) {
      return result;
    } else {
      err = result.err;
    }
  }

  return {
    success: false,
    err
  };
}

function orResultFn(...resultFns: Array<AnyResultFn>): AnyResult {
  const vals = [];
  let err;

  for (const resultFn of resultFns) {
    const result = resultFn();
    if (result.success) {
      return result;
    } else {
      err = result.err;
    }
  }

  return {
    success: false,
    err
  };
}

declare function AndResultSignature<T1, E1, T2, E2, T3, E3>(r1: Result<T1, E1>, r2: Result<T2, E2>, r3: Result<T3, E3>, ...rest: Array<void>): Result<[T1, T2, T3], E1 | E2 | E3>
declare function AndResultSignature<T1, E1, T2, E2>(r1: Result<T1, E1>, r2: Result<T2, E2>, ...rest: Array<void>): Result<[T1, T2], E1 | E2>
declare function AndResultSignature<T1, E1, T2, E2, T3, E3>(r1: Result<T1, E1>, r2: Result<T2, E2>, r3: Result<T3, E3>, ...rest: Array<void>): Result<[T1, T2, T3], E1 | E2 | E3>
declare function AndResultSignature<T1, E1, T2, E2, T3, E3, T4, E4>(r1: Result<T1, E1>, r2: Result<T2, E2>, r3: Result<T3, E3>, r4: Result<T4, E4>, ...rest: Array<void>): Result<[T1, T2, T3, T4], E1 | E2 | E3 | E4>
declare function AndResultSignature<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5>(r1: Result<T1, E1>, r2: Result<T2, E2>, r3: Result<T3, E3>, r4: Result<T4, E4>, r5: Result<T5, E5>, ...rest: Array<void>): Result<[T1, T2, T3, T4, T5], E1 | E2 | E3 | E4 | E5>
declare function AndResultSignature<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6>(r1: Result<T1, E1>, r2: Result<T2, E2>, r3: Result<T3, E3>, r4: Result<T4, E4>, r5: Result<T5, E5>, r6: Result<T6, E6>, ...rest: Array<void>): Result<[T1, T2, T3, T4, T5, T6], E1 | E2 | E3 | E4 | E5 | E6>
declare function AndResultSignature<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7>(r1: Result<T1, E1>, r2: Result<T2, E2>, r3: Result<T3, E3>, r4: Result<T4, E4>, r5: Result<T5, E5>, r6: Result<T6, E6>, r7: Result<T7, E7>, ...rest: Array<void>): Result<[T1, T2, T3, T4, T5, T6, T7], E1 | E2 | E3 | E4 | E5 | E6 | E7>
declare function AndResultSignature<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8>(r1: Result<T1, E1>, r2: Result<T2, E2>, r3: Result<T3, E3>, r4: Result<T4, E4>, r5: Result<T5, E5>, r6: Result<T6, E6>, r7: Result<T7, E7>, r8: Result<T8, E8>, ...rest: Array<void>): Result<[T1, T2, T3, T4, T5, T6, T7, T8], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8>
declare function AndResultSignature<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8, T9, E9>(r1: Result<T1, E1>, r2: Result<T2, E2>, r3: Result<T3, E3>, r4: Result<T4, E4>, r5: Result<T5, E5>, r6: Result<T6, E6>, r7: Result<T7, E7>, r8: Result<T8, E8>, r9: Result<T9, E9>, ...rest: Array<void>): Result<[T1, T2, T3, T4, T5, T6, T7, T8, T9], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9>
declare function AndResultSignature<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8, T9, E9, T10, E10>(r1: Result<T1, E1>, r2: Result<T2, E2>, r3: Result<T3, E3>, r4: Result<T4, E4>, r5: Result<T5, E5>, r6: Result<T6, E6>, r7: Result<T7, E7>, r8: Result<T8, E8>, r9: Result<T9, E9>, r10: Result<T10, E10>, ...rest: Array<void>): Result<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9 | E10>

const typedAndResult = ((andResult: any): typeof AndResultSignature);

declare function AndResultFnSignature<T1, E1, T2, E2>(r1: ResultFn<T1, E1>, r2: ResultFn<T2, E2>, ...rest: Array<void>): Result<[T1, T2], E1 | E2>
declare function AndResultFnSignature<T1, E1, T2, E2, T3, E3>(r1: ResultFn<T1, E1>, r2: ResultFn<T2, E2>, r3: ResultFn<T3, E3>, ...rest: Array<void>): Result<[T1, T2, T3], E1 | E2 | E3>
declare function AndResultFnSignature<T1, E1, T2, E2, T3, E3, T4, E4>(r1: ResultFn<T1, E1>, r2: ResultFn<T2, E2>, r3: ResultFn<T3, E3>, r4: ResultFn<T4, E4>, ...rest: Array<void>): Result<[T1, T2, T3, T4], E1 | E2 | E3 | E4>
declare function AndResultFnSignature<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5>(r1: ResultFn<T1, E1>, r2: ResultFn<T2, E2>, r3: ResultFn<T3, E3>, r4: ResultFn<T4, E4>, r5: ResultFn<T5, E5>, ...rest: Array<void>): Result<[T1, T2, T3, T4, T5], E1 | E2 | E3 | E4 | E5>
declare function AndResultFnSignature<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6>(r1: ResultFn<T1, E1>, r2: ResultFn<T2, E2>, r3: ResultFn<T3, E3>, r4: ResultFn<T4, E4>, r5: ResultFn<T5, E5>, r6: ResultFn<T6, E6>, ...rest: Array<void>): Result<[T1, T2, T3, T4, T5, T6], E1 | E2 | E3 | E4 | E5 | E6>
declare function AndResultFnSignature<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7>(r1: ResultFn<T1, E1>, r2: ResultFn<T2, E2>, r3: ResultFn<T3, E3>, r4: ResultFn<T4, E4>, r5: ResultFn<T5, E5>, r6: ResultFn<T6, E6>, r7: ResultFn<T7, E7>, ...rest: Array<void>): Result<[T1, T2, T3, T4, T5, T6, T7], E1 | E2 | E3 | E4 | E5 | E6 | E7>
declare function AndResultFnSignature<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8>(r1: ResultFn<T1, E1>, r2: ResultFn<T2, E2>, r3: ResultFn<T3, E3>, r4: ResultFn<T4, E4>, r5: ResultFn<T5, E5>, r6: ResultFn<T6, E6>, r7: ResultFn<T7, E7>, r8: ResultFn<T8, E8>, ...rest: Array<void>): Result<[T1, T2, T3, T4, T5, T6, T7, T8], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8>
declare function AndResultFnSignature<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8, T9, E9>(r1: ResultFn<T1, E1>, r2: ResultFn<T2, E2>, r3: ResultFn<T3, E3>, r4: ResultFn<T4, E4>, r5: ResultFn<T5, E5>, r6: ResultFn<T6, E6>, r7: ResultFn<T7, E7>, r8: ResultFn<T8, E8>, r9: ResultFn<T9, E9>, ...rest: Array<void>): Result<[T1, T2, T3, T4, T5, T6, T7, T8, T9], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9>
declare function AndResultFnSignature<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6, T7, E7, T8, E8, T9, E9, T10, E10>(r1: ResultFn<T1, E1>, r2: ResultFn<T2, E2>, r3: ResultFn<T3, E3>, r4: ResultFn<T4, E4>, r5: ResultFn<T5, E5>, r6: ResultFn<T6, E6>, r7: ResultFn<T7, E7>, r8: ResultFn<T8, E8>, r9: ResultFn<T9, E9>, r10: ResultFn<T10, E10>, ...rest: Array<void>): Result<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9 | E10>

const typedAndResultFn = ((andResultFn: any): typeof AndResultFnSignature);

export {
  typedAndResult as andResult,
  typedAndResultFn as andResultFn
};
