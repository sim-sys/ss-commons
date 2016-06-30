/* @flow */

import WaitGroup from '../WaitGroup.js';

class WaitGroupTests {

  async testWaitGroup() {
    const wg = new WaitGroup(3);
    wg.done();
    wg.done();
    wg.done();

    await wg.wait();
  }
}

export default WaitGroupTests;
