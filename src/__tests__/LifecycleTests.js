/* @flow */

import assert from 'assert';

import Lifecycle, {
  STARTING_UP,
  ACTIVE,
  SHUTTING_DOWN,
  SHUTDOWN
} from '../Lifecycle.js';

import Signal from '../async/Signal.js';

class LifecycleTests {
  testLifecycle() {
    const lifecycle = new Lifecycle(() => {});
    assert(lifecycle instanceof Lifecycle);
  }

  async testStartup() {
    let done = false;
    let state = null;
    const lifecycle = new Lifecycle(async () => {
      state = lifecycle._state;
      done = true;
    });
    const signal = await lifecycle.startup();
    assert(done);
    assert.equal(state, STARTING_UP);
    assert.equal(lifecycle._state, ACTIVE);
    assert(signal instanceof Signal);
  }

  async testStartupFailure() {
    const lifecycle = new Lifecycle(async () => {
      throw new Error();
    });
    const err = await lifecycle.startup().catch(e => e);
    assert(err instanceof Error);
    assert.equal(lifecycle._state, SHUTDOWN);
  }

  async testShutdown() {
    let done = false;
    let state = null;
    const lifecycle = new Lifecycle((arg, onShutdown) => {
      onShutdown.then(() => {
        state = lifecycle._state;
        done = true;
        lifecycle.onComplete();
      });
    });
    const signal = await lifecycle.startup();
    lifecycle.shutdown();

    await signal.wait();

    assert(done);
    assert.equal(state, SHUTTING_DOWN);
    assert.equal(lifecycle._state, SHUTDOWN);
  }
}

export default LifecycleTests;
