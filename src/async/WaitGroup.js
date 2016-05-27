/* @flow */

import Signal from './Signal.js';

class WaitGroup {
  _n: number;
  _signal: Signal;

  constructor(n: number) {
    this._n = n >>> 0;
    this._signal = new Signal();
  }

  done() {
    this._n--;

    if (this._n === 0) {
      this._signal.emit();
    }
  }

  wait() {
    return this._signal.wait();
  }
}

export default WaitGroup;
