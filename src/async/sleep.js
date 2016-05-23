/* @flow */

import Signal from './Signal.js';

function sleep(ms: number, interrupt?: Promise<void>): Promise<void> {
  const signal = new Signal();
  const timer = setTimeout(() => {
    signal.emit();
  }, ms);

  if (interrupt) {
    // interrupt promise is used to awake abrubtly
    interrupt.then(() => {
      clearTimeout(timer);
      signal.emit();
    });
  }

  return signal.wait();
}


export default sleep;
