/* @flow */

import Lifecycle from '../Lifecycle.js';
import Sleeper from './Sleeper.js';
import Signal from './Signal.js';

type Args = {
  interval: number,
  fn: () => void | Promise<void>
};

class Timer {
  lifecycle: Lifecycle<Args>;
  constructor() {
    const shutdownSignal = new Signal();
    this.lifecycle = new Lifecycle((args) => {
      this._run(args, shutdownSignal.wait());
    }, () => {
      shutdownSignal.emit();
    });
  }

  async _run(args: Args, onShutdown: Promise<void>) {
    const { fn, interval } = args;
    const lifecycle = this.lifecycle;

    const sleeper = new Sleeper(onShutdown);

    while (!lifecycle.isShuttingDown()) {
      try {
        await fn();
      } catch (e) {
        lifecycle.onFailure(e);
        return;
      }

      await sleeper.sleep(interval);
    }

    lifecycle.onComplete();
  }
}

export default Timer;
