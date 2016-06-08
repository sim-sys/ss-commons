/* @flow */

import assert from 'assert';

import Sleeper from '../Sleeper.js';
import sleep from '../sleep.js';

class SleeperTests {
  async testSleep() {
    const start = Date.now();
    const sleeper = new Sleeper(new Promise(() => {}));
    await sleeper.sleep(10);
    const passed = Date.now() - start;
    assert(passed >= 10);
  }

  async testInterrupt() {
    const start = Date.now();
    const sleeper = new Sleeper(sleep(5));
    await sleeper.sleep(10);
    const passed = Date.now() - start;
    assert(passed < 10);
  }
}

export default SleeperTests;
