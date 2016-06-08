/* @flow */

import Signal from './async/Signal.js';

export const INIT = 0;
export const STARTING_UP = 1;
export const ACTIVE = 2;
export const SHUTTING_DOWN = 3;
export const SHUTDOWN = 4;

type StartupFn = (
  onShutdown: () => void,
  onFailure: (err: Error) => void
) => void | Promise<void>;

type ShutdownFn = () => void;

class Lifecycle {
  _startupFn: StartupFn;
  _shutdownFn: ShutdownFn;
  _state: number; // current state
  _shutdownRequestSignal: Signal<void>;
  _shutdownSignal: Signal<void>;
  _startupSignal: Signal<void>;
  onShutdown: Promise<void>;

  constructor(startupFn: StartupFn, shutdownFn: ShutdownFn) {
    this._startupFn = startupFn;
    this._shutdownFn = shutdownFn;
    this._state = INIT;
    this._startupSignal = new Signal();
    this._shutdownSignal = new Signal();
    this._shutdownRequestSignal = new Signal();
    this.onShutdown = this._shutdownSignal.wait();
  }

  async startup(): Promise<void> {
    const state = this._state;

    if (state === ACTIVE) {
      return;
    }

    if (state === STARTING_UP) {
      this._startupSignal.wait();
      return;
    }

    if (this._state !== INIT) {
      throw new Error('Can not start up lifecycle that is already shut down');
    }

    try {
      this._state = STARTING_UP;
      const startupFn = this._startupFn;
      await startupFn(() => this.onComplete(), err => this.onFailure(err));
      this._state = ACTIVE;
    } catch (e) {
      this._state = SHUTDOWN;
      throw e;
    }

    this._startupSignal.emit();
    return;
  }

  shutdown() {
    if (this._state === INIT || this._state === STARTING_UP) {
      throw new Error('Can not shutdown lifecycle that is not started up');
    }

    if (this._state === SHUTTING_DOWN || this._state === SHUTDOWN) {
      return;
    }

    this._state = SHUTTING_DOWN;
    const shutdownFn = this._shutdownFn;
    shutdownFn(); // TODO try-catch
  }

  onComplete() {
    // TODO throwing may be not the best option
    if (this._state !== ACTIVE && this._state !== SHUTTING_DOWN && this._state !== SHUTDOWN) {
      throw new Error('Can not complete lifecycle this is not started up');
    }

    this._state = SHUTDOWN;
    this._shutdownSignal.emit();
  }

  // signal that facility is dead and will no longer work,
  // but it has been cleaned up properly
  onFailure(err: Error) {
    if (this._state !== ACTIVE) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    this._state = SHUTDOWN;
    this._shutdownSignal.fail(err);
  }

  isActive() {
    return this._state === ACTIVE;
  }

  isShuttingDown() {
    return this._state === SHUTTING_DOWN;
  }

}

export default Lifecycle;
