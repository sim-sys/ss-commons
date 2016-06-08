/* @flow */

import assert from 'assert';

import sleep from '../sleep.js';

class SleepTests {
  async testSleep() {
    const start = Date.now();
    await sleep(10);
    const passed = Date.now() - start;
    assert(passed >= 10);
  }

  async testInterrupt() {
    const start = Date.now();
    await sleep(10, sleep(5));
    const passed = Date.now() - start;
    assert(passed < 10);
  }
}

export default SleepTests;
