/* @flow */

import Signal from './Signal.js';

class Semaphore {
  _n: number;
  _r: Signal<void>;

  constructor(n: number) {
    this._n = n >>> 0;
    this._r = new Signal();
  }

  async acquire(n: number): Promise<void> {
    const nn = n >>> 0;

    while (this._n < nn) {
      await this._r.wait();
    }

    this._n -= nn;
  }

  release(n: number) {
    const nn = n >>> 0;

    this._n += nn; // TODO handle overreleasing?

    const r = this._r;
    this._r = new Signal();
    r.emit();
  }

}

export default Semaphore;
