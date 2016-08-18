/* @flow */

import assert from 'assert';

import Lock from '../Lock.js';
import sleep from '../sleep.js';
import WaitGroup from '../WaitGroup.js';

class LockTests {
  async testLock() {
    const arr = [];

    const wg = new WaitGroup(3);
    const lock = new Lock();

    lock.synchronize(async function() {
      arr.push(0);
      await sleep(0);
      arr.push(1);
      await sleep(0);
      arr.push(2);
      wg.done();
    });

    await sleep(0);

    lock.synchronize(async function() {
      arr.push(3);
      await sleep(0);
      arr.push(4);
      await sleep(0);
      arr.push(5);
      await sleep(0);
      arr.push(6);
      wg.done();
    });

    lock.synchronize(async function() {
      arr.push(7);
      await sleep(0);
      arr.push(8);
      await sleep(0);
      arr.push(9);
      wg.done();
    });

    await wg.wait();
    assert.deepEqual(arr, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  }
}

export default LockTests;
