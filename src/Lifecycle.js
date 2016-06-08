/* @flow */

import Signal from './async/Signal.js';

export const INIT = 0;
export const STARTING_UP = 1;
export const ACTIVE = 2;
export const SHUTTING_DOWN = 3;
export const SHUTDOWN = 4;

type OnShutdown = () => void;
type OnFailure = (err: Error) => void;
type HookFn = (onShutdown: OnShutdown, onFailure: OnFailure) => void | Promise<void>;

class Lifecycle {
  _startupFn: HookFn;
  _shutdownFn: HookFn;
  _onShutdownFn: OnShutdown;
  _onFailureFn: OnFailure;
  _state: number; // current state
  _shutdownSignal: Signal<void>;
  _startupSignal: ?Signal<void>;
  onShutdown: Promise<void>;

  constructor(startupFn: HookFn, shutdownFn: HookFn) {
    this._startupFn = startupFn;
    this._shutdownFn = shutdownFn;

    this._onShutdownFn = () => this._onShutdown();
    this._onFailureFn = (err) => this._onFailure(err);

    this._state = INIT;
    this._startupSignal = null;
    this._shutdownSignal = new Signal();
    this.onShutdown = this._shutdownSignal.wait();
  }

  async startup(): Promise<void> {
    const state = this._state;

    if (state === ACTIVE) {
      return;
    }

    if (state === STARTING_UP) {
      if (!this._startupSignal) {
        this._startupSignal = new Signal();
      }

      this._startupSignal.wait();
      return;
    }

    if (this._state !== INIT) {
      throw new Error('Can not start up lifecycle that is already shut down');
    }

    try {
      this._state = STARTING_UP;
      const startupFn = this._startupFn;
      await startupFn(this._onShutdownFn, this._onFailureFn);
      this._state = ACTIVE;
    } catch (e) {
      this._state = SHUTDOWN;
      // TODO emit shutdown
      throw e;
    }

    if (this._startupSignal) {
      this._startupSignal.emit();
      this._startupSignal = null;
    }
  }

  shutdown() {
    if (this._state === INIT || this._state === STARTING_UP) {
      throw new Error('Can not shutdown lifecycle that is not started up');
    }

    if (this._state === SHUTTING_DOWN || this._state === SHUTDOWN) {
      return;
    }

    try {
      this._state = SHUTTING_DOWN;
      const shutdownFn = this._shutdownFn;
      shutdownFn(this._onShutdownFn, this._onFailureFn); // TODO handle async errors as well
    } catch (e) {
      this._state = SHUTDOWN;
      // TODO emit shutdown
    }
  }

  _onShutdown() {
    // TODO throwing may be not the best option
    if (this._state !== ACTIVE && this._state !== SHUTTING_DOWN && this._state !== SHUTDOWN) {
      throw new Error('Can not complete lifecycle this is not started up');
    }

    this._state = SHUTDOWN;
    this._shutdownSignal.emit();
  }

  _onFailure(err: Error) {
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
