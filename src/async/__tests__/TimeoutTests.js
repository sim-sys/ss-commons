/* @flow */

import assert from 'assert';
import timeout from '../timeout.js';
import sleep from '../sleep.js';
import { unwrap } from '../../index.js';
import {
  catchPromise,
  convertToError
} from '../../util.js';

class TimeoutTests {

  async testTimeoutSuccess() {
    const val = await timeout(async () => 3, 0)
    assert.equal(val, 3);
  }

  async testTimeoutFailure() {
    const err = await catchPromise(
      timeout(async () => {
         await sleep(100);
       }, 0)
    );

    assert.equal(convertToError(err).message, 'Timeout');
  }

}

export default TimeoutTests;
