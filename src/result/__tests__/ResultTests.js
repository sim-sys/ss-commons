/* @flow */

import assert from 'assert';

import type { Result } from '../index.js';
import { Success, Failure } from '../index.js';


class ResultTests {
  testSuccessRefinement() {
    const foo: Result<string, string> = Success('bar');

    if (foo.ok) {
      if (foo.ok)
        assert.equal(foo.v, 'bar');
    }
  }

  testFailureRefinement() {
    const foo: Result<string, string> = Failure('bar');

    if (!foo.ok) {
      assert.equal(foo.r, 'bar');
    }
  }

  testUnsafeAccess() {
    const foo: Result<string, string> = Success('bar');
    // $ExpectError
    foo.v;

    // $ExpectError
    foo.r;
  }
}

export default ResultTests;
