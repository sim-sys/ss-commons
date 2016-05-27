/* @flow */

import {
  expect
} from 'chai';

import Semaphore from '../Semaphore.js';
import sleep from '../sleep.js';

describe('Semaphore', () => {
  it('should work', async () => {
    const s = new Semaphore(4);
    let done = false;

    setTimeout(() => {
      done = true;
      s.release(1);
    }, 0);

    await s.acquire(1);
    await s.acquire(4);

    expect(done).to.be.equal(true);
  });

  it('should limit concurrency', async () => {
    const concurrency = 4;
    const s = new Semaphore(concurrency);
    let n = 40;
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
    expect(max).to.be.equal(concurrency);
  });
});
