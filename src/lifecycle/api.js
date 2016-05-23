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
export function init<Args>(obj: Facility<Args>) {
  obj.lifecycle = new Lifecycle(obj);
}

export function startup<Args>(
  obj: Facility<Args>,
  args: Args
): Promise<Signal<void>> {
  if (!obj.lifecycle) {
    throw new Error('wtf'); // TODO
  }

  return obj.lifecycle.startup(args);
}

export function shutdown<Args>(
  obj: Facility<Args> // TODO support timeouts/deadlines
): Promise<void> {
  if (!obj.lifecycle) {
    throw new Error('wtf');
  }

  return obj.lifecycle.shutdown();
}

// run a facility and wait for completion
export function run<Args>(obj: Facility<Args>, args: Args): Promise<void> {
  return startup(obj, args).then(s => s.wait());
}

export function isActive<Args>(obj: Facility<Args>): boolean {
  if (!obj.lifecycle) {
    return false;
  }

  return obj.lifecycle.isActive();
}

export function signalCompletion<Args>(obj: Facility<Args>) {
  if (!obj.lifecycle) {
    throw new Error('wtf');
  }

  return obj.lifecycle.onComplete();
}

export function signalFailure<Args>(obj: Facility<Args>, error: mixed) {
  const err = wrapError(error);

  if (!obj.lifecycle) {
    throw new Error('wtf');
  }

  return obj.lifecycle.onFailure(err);
}
