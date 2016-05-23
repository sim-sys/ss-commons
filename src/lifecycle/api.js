/* @flow */

import Lifecycle from './Lifecycle.js';

import {
  wrapError
} from './util.js';

import type Signal from '../async/Signal.js';

import type {
  Facility
} from './types.js';


// doesn't do much, but can validate protocol conformance
// earlier
export function init<Args, Result>(obj: Facility<Args, Result>) {
  obj.lifecycle = new Lifecycle(obj);
}


export function startup<Args, Result>(
  obj: Facility<Args, Result>,
  args: Args
): Promise<Signal<Result>> {
  if (!obj.lifecycle) {
    throw new Error('wtf'); // TODO
  }

  return obj.lifecycle._startup(args);
}

export function shutdown<Args, Result>(
  obj: Facility<Args, Result> // TODO support timeouts/deadlines
): Promise<?Result> {
  if (!obj.lifecycle) {
    throw new Error('wtf');
  }

  return obj.lifecycle._shutdown();
}

// run a facility and wait for completion
export function run<Args, Result>(obj: Facility<Args, Result>, args: Args): Promise<Result> {
  return startup(obj, args).then(s => s.wait());
}

export function isActive<Args, Result>(obj: Facility<Args, Result>): boolean {
  if (!obj.lifecycle) {
    return false;
  }

  return obj.lifecycle._isActive();
}

export function signalCompletion<Args, Result>(obj: Facility<Args, Result>, result: Result) {
  if (!obj.lifecycle) {
    throw new Error('wtf');
  }

  return obj.lifecycle._onComplete(result);
}

export function signalFailure<Args, Result>(obj: Facility<Args, Result>, error: mixed) {
  const err = wrapError(error);

  if (!obj.lifecycle) {
    throw new Error('wtf');
  }

  return obj.lifecycle._onFailure(err);
}
