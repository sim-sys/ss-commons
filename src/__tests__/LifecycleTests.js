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

  async testStartupWhileStartingUp() {
    let i = 0;

    const lifecycle = new Lifecycle(async () => {
      i++;
    }, () => {});

    await Promise.all([
      lifecycle.startup(),
      lifecycle.startup()
    ]);

    assert.equal(i, 1);
  }

  async testMultipleStartupWhileStartingUp() {
    let i = 0;

    const lifecycle = new Lifecycle(async () => {
      i++;
    }, () => {});

    await Promise.all([
      lifecycle.startup(),
      lifecycle.startup(),
      lifecycle.startup()
    ]);

    assert.equal(i, 1);
  }

  async testStartupWhileShutdown() {
    const lifecycle = new Lifecycle(() => {}, onShutdown => onShutdown());

    await lifecycle.startup();
    lifecycle.shutdown();

    await lifecycle.onShutdown;
    const err = await lifecycle.startup().catch(e => e);
    assert(err instanceof Error);
  }

  async testStartupWhileActive() {
    let i = 0;

    const lifecycle = new Lifecycle(async () => {
      i++;
    }, () => {});

    await lifecycle.startup();
    await lifecycle.startup();

    assert.equal(i, 1);
  }

  async testStartupFailure() {
    const lifecycle = new Lifecycle(async () => {
      throw new Error();
    }, () => {});
    const err = await lifecycle.startup().catch(e => e);
    assert(err instanceof Error);
    assert.equal(lifecycle._state, SHUTDOWN);
    const err2 = await lifecycle.onShutdown.catch(e => e);
    assert.equal(err, err2);
  }

  async testShutdown() {
    let done = false;
    let state = null;
    const lifecycle = new Lifecycle(() => {}, onShutdown => {
      state = lifecycle._state;
      done = true;
      onShutdown();
    });

    await lifecycle.startup();
    lifecycle.shutdown();

    await lifecycle.onShutdown;

    assert(done);
    assert.equal(state, SHUTTING_DOWN);
    assert.equal(lifecycle._state, SHUTDOWN);
  }

  testEarlyShutdown() {
    const lifecycle = new Lifecycle(() => {}, () => {});
    assert.throws(() => lifecycle.shutdown(), Error);
  }

  async testFailedShutdown() {
    const err = new Error();
    const lifecycle = new Lifecycle(() => {}, () => {
      throw err;
    });

    await lifecycle.startup();
    lifecycle.shutdown();
    const err2 = await lifecycle.onShutdown.catch(e => e);
    assert.equal(lifecycle._state, SHUTDOWN);
    assert.equal(err, err2);
  }
}

export default LifecycleTests;
