/* @flow */

import Signal from '../async/Signal.js';

import type {
  Facility
} from './types.js';

export const INIT = 0;
export const STARTING_UP = 1;
export const ACTIVE = 2;
export const SHUTTING_DOWN = 3;
export const SHUTDOWN = 4;

// Opaque object, that manages state of the facilility
// since it's entirely opaque(=private), all fields are unprefixed
// TODO need a way to hide method from consumers via flow
class Lifecycle<Args> {
  target: Facility<Args>; // managed object
  state: number; // current state
  args: ?Args; // provided args
  shutdownSignal: Signal<void>;

  constructor(target: Facility<Args>) {
    this.target = target;
    this.state = INIT;
    this.args = null;
    this.shutdownSignal = new Signal();
  }

  // startup the facility
  async startup(args: Args): Promise<Signal<void>> {
    const target = this.target;

    if (this.state !== INIT) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    this.args = args;

    try {
      this.state = STARTING_UP;
      await target.startup(args);
      this.state = ACTIVE;
    } catch (e) {
      this.state = SHUTDOWN;
      throw e;
    }

    return this.shutdownSignal;
  }

  // externally shutdown facility, may be produce result or may not
  async shutdown(): Promise<void> {
    const target = this.target;

    if (this.state !== ACTIVE) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    try {
      this.state = SHUTTING_DOWN;
      await target.shutdown();
      this.state = SHUTDOWN;
      this.shutdownSignal.emit();
    } catch (e) {
      this.state = SHUTDOWN;
      this.shutdownSignal.fail(e); // TODO wrap error
      throw e;
    }
  }

  // signal that facility is done doing things successfully
  onComplete() {
    if (this.state !== ACTIVE) {
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
