/* @flow */

import Signal from './Signal.js';

// the same as sleep, but could be interrupted only once
class Sleeper {
  _timer: any;
  _signal: ?Signal<void>;

  constructor(interrupt: Promise<void>) {
    this._timer = null;
    interrupt.then(() => this._done());
  }

  _done() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    const signal = this._signal;
    this._signal = null;

    /* istanbul ignore else */
    if (signal) {
      signal.emit();
    }
  }

  sleep(ms: number): Promise<void> {
    const signal = this._signal = new Signal();

    this._timer = setTimeout(() => {
      this._timer = null;
      this._done();
    }, ms);

    return signal.wait();
  }
}

export default Sleeper;
