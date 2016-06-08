/* @flow */

import Lifecycle from '../Lifecycle.js';
import Sleeper from './Sleeper.js';
import Signal from './Signal.js';

import { unwrap } from '../core/util.js';

type Args = {
  interval: number,
  fn: () => void | Promise<void>
};

class Timer {
  lifecycle: Lifecycle;
  _args: ?Args;
  constructor() {
    const shutdownSignal = new Signal();
    this.lifecycle = new Lifecycle((onShutdown, onFailure) => {
      this._run(unwrap(this._args), shutdownSignal.wait(), onShutdown, onFailure);
    }, () => {
      shutdownSignal.emit();
    });
  }

  startup(args: Args) {
    this._args = args;
    this.lifecycle.startup();
  }

  async _run(
    args: Args,
    shutdownPromise: Promise<void>,
    onShutdown: () => void,
    onFailure: (err: Error) => void
  ) {
    const { fn, interval } = args;
    const lifecycle = this.lifecycle;

    const sleeper = new Sleeper(shutdownPromise);

    while (!lifecycle.isShuttingDown()) {
      try {
        await fn();
      } catch (e) {
        onFailure(e);
        return;
      }

      await sleeper.sleep(interval);
    }

    onShutdown();
  }
}

export default Timer;
