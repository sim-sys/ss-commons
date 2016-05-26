/* @flow */

import {
  expect
} from 'chai';

import Lifecycle, {
  STARTING_UP,
  ACTIVE,
  SHUTTING_DOWN,
  SHUTDOWN
} from '../Lifecycle.js';

import Signal from '../../async/Signal.js';

describe('Lifecycle', () => {
  it('should work', async () => {
    const lifecycle = new Lifecycle(() => {});
    expect(lifecycle).to.be.an.instanceOf(Lifecycle);
  });

  describe('startup', () => {
    it('should startup object', async () => {
      let done = false;
      let state = null;
      const lifecycle = new Lifecycle(async () => {
        state = lifecycle._state;
        done = true;
      });
      const signal = await lifecycle.startup();
      expect(done).to.be.equal(true);
      expect(state).to.be.equal(STARTING_UP);
      expect(lifecycle._state).to.be.equal(ACTIVE);
      expect(signal).to.be.instanceOf(Signal);
    });

    it('should handle failure', async () => {
      const lifecycle = new Lifecycle(async () => {
        throw new Error();
      });
      const err = await lifecycle.startup().catch(e => e);
      expect(err).to.be.an.instanceOf(Error);
      expect(lifecycle._state).to.be.equal(SHUTDOWN);
    });
  });

  describe('shutdown', () => {
    it('should shutdown object', async () => {
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
      await lifecycle.shutdown();


      expect(done).to.be.equal(true);
      expect(state).to.be.equal(SHUTTING_DOWN);
      expect(lifecycle._state).to.be.equal(SHUTDOWN);

      await signal.wait();
    });
  });
});
