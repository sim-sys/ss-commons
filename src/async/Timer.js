/* @flow */

import type Lifecycle from '../lifecycle/Lifecycle.js';

import {
  signalFailure
} from '../lifecycle/api.js';

import sleep from './sleep.js';
import Signal from './Signal.js';

type Args = {
  interval: number,
  fn: () => void | Promise<void>
};

class Timer {

  lifecycle: ?Lifecycle<Args, void>;
  _shutdownSignal: Signal<void>;
  _shutdownCompletedSignal: Signal<void>;
  _shuttingDown: boolean;

  constructor() {
    this.lifecycle = null;
    this._shuttingDown = false;
    this._shutdownSignal = new Signal();
    this._shutdownCompletedSignal = new Signal();
  }

  async startup(args: Args) {
    // run without awaiting
    this.start(args);
  }

  async start(args: Args) {
    const { fn, interval } = args;

    while(!this._shuttingDown) {
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
    this._shuttingDown = true;
    this._shutdownSignal.emit();
    return this._shutdownCompletedSignal.wait();
  }

}

export default Timer;
