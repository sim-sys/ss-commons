/* @flow */

import assert from 'assert';
import { convertToMocha } from '../../testing/util.js';

import Signal from '../Signal.js';

class SignalTests {
  async testSignal() {
    const s = new Signal();
    process.nextTick(() => s.emit());
    await s.wait();
  }

  async testFail() {
    const s = new Signal();
    process.nextTick(() => s.fail(new Error()));
    const err = await s.wait().catch(e => e);
    assert(err instanceof Error);
  }
}

convertToMocha(new SignalTests());

export default SignalTests;
