/* @flow */

import type Lifecycle from './Lifecycle.js';

// Facility is a thing with lifecycle
// facitility is a thing that:
//  - should be started with some args;
//  - can do some job;
//  - can fail and die permanently;
//  - can succeed;
//  - can be shut down gracefully.
// So, it's  basically a process.
// When it dies, there is no way to revive it,
// so you should just move on and create other instances.
export type Facility<Args> = {
  // lifecycle property should be declared, to
  // define associated types
  lifecycle: Lifecycle<Args>,
};
