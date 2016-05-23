/* @flow */

import {
  expect
} from 'chai';

import sleep from '../sleep.js';

describe('sleep', () => {
  it('should work', async () => {
    const start = Date.now();
    await sleep(10);
    const passed = Date.now() - start;
    expect(passed >= 10).to.be.equal(true);
  });

  it('should be interruptible', async () => {
    const start = Date.now();
    await sleep(10, sleep(5));
    const passed = Date.now() - start;
    expect(passed < 10).to.be.equal(true);
  });
});
