/* @flow */

import Signal from '../async/Signal.js';

import type {
  Facility
} from './types.js';

const INIT = 0;
const STARTING_UP = 1;
const ACTIVE = 2;
const SHUTTING_DOWN = 3;
const SHUTDOWN = 4;

// Opaque object, that manages state of the facilility
class Lifecycle<Args, Result> {
  _target: Facility<Args, Result>;
  _state: number;
  _args: ?Args;
  _result: ?Result;
  _shutdownSignal: Signal<Result>;

  constructor(target: Facility<Args, Result>) {
    this._target = target;
    this._state = INIT;
    this._args = null;
    this._result = null;
    this._shutdownSignal = new Signal();
  }

  // startup the facility
  async _startup(args: Args): Promise<Signal<Result>> {
    const target = this._target;

    if (this._state !== INIT) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    this._args = args;

    try {
      this._state = STARTING_UP;
      await target.startup(args);
      this._state = ACTIVE;
    } catch (e) {
      this._state = SHUTDOWN;
      throw e;
    }

    return this._shutdownSignal;
  }

  // externally shutdown facility, may be produce result or may not
  async _shutdown(): Promise<?Result> {
    const target = this._target;

    if (this._state !== ACTIVE) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    try {
      this._state = SHUTTING_DOWN;
      await target.shutdown();
      this._state = SHUTDOWN;
    } catch (e) {
      this._state = SHUTDOWN;
      throw e;
    }
  }

  // signal that facility is done doing things successfully
  _onComplete(result: Result) {
    if (this._state !== ACTIVE) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    this._shutdownSignal.emit(result);
  }

  // signal that facility is dead and will no longer work,
  // but it has been cleaned up properly
  _onFailure(err: Error) {
    if (this._state !== ACTIVE) {
      throw new Error('wtf'); // TODO try and handle other cases
    }

    this._shutdownSignal.fail(err);
  }

  _isActive() {
    return this._state === ACTIVE;
  }

}

export default Lifecycle;
