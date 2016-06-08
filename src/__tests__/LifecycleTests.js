/* @flow */

import assert from 'assert';

import Lifecycle, {
  STARTING_UP,
  ACTIVE,
  SHUTTING_DOWN,
  SHUTDOWN
} from '../Lifecycle.js';

class LifecycleTests {
  testLifecycle() {
    const lifecycle = new Lifecycle(() => {}, () => {});
    assert(lifecycle instanceof Lifecycle);
  }

  async testStartup() {
    let done = false;
    let state = null;
    const lifecycle = new Lifecycle(async () => {
      state = lifecycle._state;
      done = true;
    }, () => {});
    await lifecycle.startup();
    assert(done);
    assert.equal(state, STARTING_UP);
    assert.equal(lifecycle._state, ACTIVE);
  }

  async testStartupFailure() {
    const lifecycle = new Lifecycle(async () => {
      throw new Error();
    }, () => {});
    const err = await lifecycle.startup().catch(e => e);
    assert(err instanceof Error);
    assert.equal(lifecycle._state, SHUTDOWN);
  }

  async testShutdown() {
    let done = false;
    let state = null;
    const lifecycle = new Lifecycle(() => {}, () => {
      state = lifecycle._state;
      done = true;
      lifecycle.onComplete();
    });

    await lifecycle.startup();
    lifecycle.shutdown();

    await lifecycle.onShutdown;

    assert(done);
    assert.equal(state, SHUTTING_DOWN);
    assert.equal(lifecycle._state, SHUTDOWN);
  }
}

export default LifecycleTests;
