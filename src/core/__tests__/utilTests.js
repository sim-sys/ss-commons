/* @flow */

import assert from 'assert';

import type {
  Success as SuccessT,
  Failure as FailureT
} from '../types.js';

import {
  unwrap,
  Success,
  Failure,
  unwrapSuccess
} from '../util.js';

class CoreUtilTests {
  testUnwrap() {
    const obj = {};
    const maybeObj: ?{} = obj;
    const unwrapped = unwrap(maybeObj);
    assert.equal(unwrapped, obj);
  }

  testUnwrapFail() {
    const maybeObj: ?{} = null;
    assert.throws(() => unwrap(maybeObj), Error);
  }

  testSuccess() {
    const result: SuccessT<number> = Success(4);
    assert.equal(result.success, true);
    assert.equal(result.val, 4);
  }

  testFailure() {
    const result: FailureT<string> = Failure('FOO_BAR');
    assert(!result.success);
    assert.equal(result.err, 'FOO_BAR');
  }

  testUnwrapSuccess() {
    const result = Success(4);
    const unwrapped = unwrapSuccess(result);
    assert.equal(unwrapped, 4);
  }

  testUnwrapSuccessFail() {
    const result = Failure('FOO');
    assert.throws(() => unwrapSuccess(result), Error);
  }
}

export default CoreUtilTests;
