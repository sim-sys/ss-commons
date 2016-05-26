/* @flow */

import {
  expect
} from 'chai';

import Sleeper from '../Sleeper.js';
import sleep from '../sleep.js';

describe('Sleep', () => {
  it('should work', async () => {
    const start = Date.now();
    const sleeper = new Sleeper(new Promise(() => {}));
    await sleeper.sleep(10);
    const passed = Date.now() - start;
    expect(passed >= 10).to.be.equal(true);
  });

  it('should be interruptible', async () => {
    const start = Date.now();
    const sleeper = new Sleeper(sleep(5));
    await sleeper.sleep(10);
    const passed = Date.now() - start;
    expect(passed < 10).to.be.equal(true);
  });
});
