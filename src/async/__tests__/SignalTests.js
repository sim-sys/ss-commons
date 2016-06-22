/* @flow */

import assert from 'assert';

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

  async testToCallbackSuccess() {
    const s: Signal<void> = new Signal();

    function fn(cb: (err: ?Error) => void) {
      process.nextTick(cb);
    }

    fn(s.toCallback());
    await s.wait();
  }

  async testToCallbackError() {
    const s: Signal<void> = new Signal();

    function fn(cb: (err: ?Error) => void) {
      process.nextTick(() => cb(new Error()));
    }

    fn(s.toCallback());
    const err = await s.wait().catch(e => e);
    assert(err instanceof Error);
  }
}

export default SignalTests;
