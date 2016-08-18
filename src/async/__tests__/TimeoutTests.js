/* @flow */

import assert from 'assert';
import timeout from '../timeout.js';
import sleep from '../sleep.js';
import { unwrap } from '../../index.js';

class TimeoutTests {

  async testTimeoutSuccess() {
    const val = await timeout(async () => 3, 0)
    assert.equal(val, 3);
  }

  async testTimeoutFailure() {
    let err;

    try {
     await timeout(async () => {
        await sleep(100);
      }, 0);
    } catch (e) {
      err = e;
    }

    assert.equal(unwrap(err).message, 'Timeout');
  }

}

export default TimeoutTests;
