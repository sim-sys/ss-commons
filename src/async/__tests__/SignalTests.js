/* @flow */

import {
  expect
} from 'chai';

import Signal from '../Signal.js';

describe('Signal', () => {
  it('should work', async () => {
    const s = new Signal();
    process.nextTick(() => s.emit());
    await s.wait();
  });

  it('should be able to fail', async () => {
    const s = new Signal();
    process.nextTick(() => s.fail(new Error()));
    const err = await s.wait().catch(e => e);
    expect(err).to.be.instanceOf(Error);
  });
});
