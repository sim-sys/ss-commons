/* @flow */

import sleep from './sleep.js';

function timeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return Promise.race([ // TODO propagate cancellation
    fn(),
    sleep(ms).then(() => Promise.reject('Timeout'))
  ]);
}

export default timeout;
