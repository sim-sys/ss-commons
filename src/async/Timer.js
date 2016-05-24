/* @flow */

import type Lifecycle from '../lifecycle/Lifecycle.js';

import {
  init,
  signalFailure,
  isShuttingDown
} from '../lifecycle/api.js';

import {
  unwrap
} from '../utils/flow.js';

import sleep from './sleep.js';
import Signal from './Signal.js';

type Args = {
  interval: number,
  fn: () => void | Promise<void>
};

class Timer {

  lifecycle: ?Lifecycle<Args>;
  // TODO use lifecycle instead of custom signals
  _shutdownSignal: Signal<void>; // signal that shutdown is requested
  _shutdownCompletedSignal: Signal<void>; // signal that shutdown is completed

  constructor() {
    init(this);
    this._shutdownSignal = new Signal();
    this._shutdownCompletedSignal = new Signal();
  }

  async startup(args: Args) {
    // run without awaiting
    this.start(args);
  }

  async start(args: Args) {
    const { fn, interval } = args;
    const lifecycle = unwrap(this.lifecycle);

    while (!lifecycle.isShuttingDown()) {
      try {
        await fn();
      } catch (e) {
        signalFailure(this, e);
        return;
      }

      await sleep(interval, this._shutdownSignal.wait());
    }

    this._shutdownCompletedSignal.emit();
  }

  async shutdown(): Promise<void> {
    this._shutdownSignal.emit();
    return this._shutdownCompletedSignal.wait();
  }

}

export default Timer;
