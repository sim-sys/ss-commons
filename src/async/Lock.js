/* @flow */

import Signal from './Signal.js';

// used to serialize asynchronouse operations
// yes, you still need locks in js
class Lock {
  _signal: ?Signal<void>;

  constructor() {
    this._signal = null;
  }

  async lock(): Promise<void> {
    while (this._signal) {
      await this._signal.wait();
    }

    this._signal = new Signal();
  }

  async synchronize<T>(fn: () => Promise<T>): Promise<T> {
    await this.lock();
    try {
      return await fn();
    } finally {
      this.unlock();
    }
  }

  unlock(): void {
    const signal = this._signal;
    this._signal = null;

    if (signal) {
      signal.emit();
    }
  }
}

export default Lock;
