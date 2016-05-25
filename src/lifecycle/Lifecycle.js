/* @flow */

import Signal from '../async/Signal.js';

export const INIT = 0;
export const STARTING_UP = 1;
export const ACTIVE = 2;
export const SHUTTING_DOWN = 3;
export const SHUTDOWN = 4;

type StartupFn<Args> = (args: Args, shutdown: Promise<void>) => void | Promise<void>;

// Opaque object, that manages state of the facilility
// since it's entirely opaque(=private), all fields are unprefixed
// TODO need a way to hide method from consumers via flow
class Lifecycle<Args> {
  _startupFn: StartupFn;
  state: number; // current state
  args: ?Args; // provided args
  _shutdownRequestSignal: Signal<void>;
  shutdownSignal: Signal<void>;

  constructor(startupFn: StartupFn<Args>) {
    this._startupFn = startupFn;
    this.state = INIT;
    this.args = null;
    this.shutdownSignal = new Signal();
    this._shutdownRequestSignal = new Signal();
  }

  // startup the facility
  async startup(args: Args): Promise<Signal<void>> {
    if (this.state !== INIT) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    this.args = args;

    try {
      this.state = STARTING_UP;
      const startupFn = this._startupFn;
      await startupFn(args, this._shutdownRequestSignal.wait());
      this.state = ACTIVE;
    } catch (e) {
      this.state = SHUTDOWN;
      throw e;
    }

    return this.shutdownSignal;
  }

  // request shutdown
  async shutdown(): Promise<void> {
    if (this.state !== ACTIVE) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    this.state = SHUTTING_DOWN;
    this._shutdownRequestSignal.emit();

    return this.shutdownSignal.wait();
  }

  // signal that facility is done doing things successfully
  onComplete() {
    if (this.state !== ACTIVE && this.state !== SHUTTING_DOWN) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    this.state = SHUTDOWN;
    this.shutdownSignal.emit();
  }

  // signal that facility is dead and will no longer work,
  // but it has been cleaned up properly
  onFailure(err: Error) {
    if (this.state !== ACTIVE) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    this.state = SHUTDOWN;
    this.shutdownSignal.fail(err);
  }

  isActive() {
    return this.state === ACTIVE;
  }

  isShuttingDown() {
    return this.state === SHUTTING_DOWN;
  }

}

export default Lifecycle;
