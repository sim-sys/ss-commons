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
    const instance = {
      lifecycle: null,
      startup: () => Promise.resolve(),
      shutdown: () => Promise.resolve()
    };


    const lifecycle = new Lifecycle(instance);
    expect(lifecycle).to.be.an.instanceOf(Lifecycle);
  });

  describe('startup', () => {
    it('should startup object', async () => {
      let done = false;
      let state = null;
      const instance = {
        lifecycle: null,
        startup: async () => {
          state = lifecycle.state;
          done = true;
        },
        shutdown: () => Promise.resolve()
      };

      const lifecycle = new Lifecycle(instance);
      const signal = await lifecycle.startup();
      expect(done).to.be.equal(true);
      expect(state).to.be.equal(STARTING_UP);
      expect(lifecycle.state).to.be.equal(ACTIVE);
      expect(signal).to.be.instanceOf(Signal);
    });

    it('should handle failure', async () => {
      const instance = {
        lifecycle: null,
        startup: async () => {
          throw new Error();
        },
        shutdown: () => Promise.resolve()
      };

      const lifecycle = new Lifecycle(instance);
      const err = await lifecycle.startup().catch(e => e);
      expect(err).to.be.an.instanceOf(Error);
      expect(lifecycle.state).to.be.equal(SHUTDOWN);
    });
  });

  describe('shutdown', () => {
    it('should shutdown object', async () => {
      let done = false;
      let state = null;
      const instance = {
        lifecycle: null,
        startup: () => Promise.resolve(),
        shutdown: async () => {
          state = lifecycle.state;
          done = true;
        },
      };

      const lifecycle = new Lifecycle(instance);
      const signal = await lifecycle.startup();
      await lifecycle.shutdown();


      expect(done).to.be.equal(true);
      expect(state).to.be.equal(SHUTTING_DOWN);
      expect(lifecycle.state).to.be.equal(SHUTDOWN);

      await signal.wait();
    });
  });
});
