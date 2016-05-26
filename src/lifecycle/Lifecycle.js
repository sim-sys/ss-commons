/* @flow */

import Signal from '../async/Signal.js';

export const INIT = 0;
export const STARTING_UP = 1;
export const ACTIVE = 2;
export const SHUTTING_DOWN = 3;
export const SHUTDOWN = 4;

type StartupFn<Args> = (args: Args, shutdown: Promise<void>) => void | Promise<void>;

class Lifecycle<Args> {
  _startupFn: StartupFn;
  _state: number; // current state
  _shutdownRequestSignal: Signal<void>;
  _shutdownSignal: Signal<void>;

  constructor(startupFn: StartupFn<Args>) {
    this._startupFn = startupFn;
    this._state = INIT;
    this._shutdownSignal = new Signal();
    this._shutdownRequestSignal = new Signal();
  }

  // startup the facility
  async startup(args: Args): Promise<Signal<void>> {
    if (this._state !== INIT) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    try {
      this._state = STARTING_UP;
      const startupFn = this._startupFn;
      await startupFn(args, this._shutdownRequestSignal.wait());
      this._state = ACTIVE;
    } catch (e) {
      this._state = SHUTDOWN;
      throw e;
    }

    return this._shutdownSignal;
  }

  // request shutdown
  shutdown() {
    if (this._state !== ACTIVE) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    this._state = SHUTTING_DOWN;
    this._shutdownRequestSignal.emit();
  }

  // signal that facility is done doing things successfully
  onComplete() {
    if (this._state !== ACTIVE && this._state !== SHUTTING_DOWN) {
      throw new Error('wtf'); // TODO try and handle other cases
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
