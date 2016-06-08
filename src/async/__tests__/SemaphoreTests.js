/* @flow */

import assert from 'assert';

import Semaphore from '../Semaphore.js';
import sleep from '../sleep.js';

class SemaphoreTests {
  async testSemaphore() {
    const s = new Semaphore(4);
    let done = false;

    setTimeout(() => {
      done = true;
      s.release(1);
    }, 0);

    await s.acquire(1);
    await s.acquire(4);

    assert.ok(done);
  }

  async testConcurrency() {
    const concurrency = 4;
    const s = new Semaphore(concurrency);
    const n = 40;
    let c = 0;
    let max = 0;

    for (let i = 0; i < n; i++) {
      await s.acquire(1);
      (async () => {
        c++;
        await sleep(1);
        max = Math.max(max, c);
        c--;
        s.release(1);
      })();
    }

    await s.acquire(concurrency);
    assert.equal(max, concurrency);
  }
}

export default SemaphoreTests;
