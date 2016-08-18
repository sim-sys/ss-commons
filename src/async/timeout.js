/* @flow */

import sleep from './sleep.js';

function timeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  const result = fn();
  const interrupt = fn().then(() => {});

  return Promise.race([ // TODO propagate cancellation
    result,
    sleep(ms, interrupt).then(() => Promise.reject(new Error('Timeout')))
  ]);
}

export default timeout;
