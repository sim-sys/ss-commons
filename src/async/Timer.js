/* @flow */

import Lifecycle from '../lifecycle/Lifecycle.js';
import sleep from './sleep.js';

type Args = {
  interval: number,
  fn: () => void | Promise<void>
};

class Timer {
  lifecycle: Lifecycle<Args>;
  constructor() {
    this.lifecycle = new Lifecycle((args, onShutdown) => {
      this._run(args, onShutdown);
    });
  }

  async _run(args: Args, onShutdown: Promise<void>) {
    const { fn, interval } = args;
    const lifecycle = this.lifecycle;

    while (!lifecycle.isShuttingDown()) {
      try {
        await fn();
      } catch (e) {
        lifecycle.onFailure(e);
        return;
      }

      // TODO this probably leaks memory, because we keep
      // adding handlers to onShutdown promise
      await sleep(interval, onShutdown);
    }

    lifecycle.onComplete();
  }
}

export default Timer;
