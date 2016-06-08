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
    this.lifecycle = new Lifecycle((args) => {
      this._run(unwrap(this._args), shutdownSignal.wait());
    }, () => {
      shutdownSignal.emit();
    });
  }

  startup(args: Args) {
    this._args = args;
    this.lifecycle.startup();
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
