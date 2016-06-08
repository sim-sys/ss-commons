/* @flow */

import assert from 'assert';

import Timer from '../Timer.js';

class TimerTests {
  async testTimer() {
    const timer = new Timer();
    assert(timer instanceof Timer);
  }

  async testTimerRun() {
    const timer = new Timer();
    let i = 0;
    const args = {
      interval: 1,
      fn: () => {
        i++;
        if (i === 3) {
          timer.lifecycle.shutdown();
        }
      }
    };

    await timer.lifecycle.startup(args);
    await timer.lifecycle.onShutdown;

    assert.equal(i, 3);
  }

  async testError() {
    const timer = new Timer();
    let i = 0;
    const args = {
      interval: 1,
      fn: () => {
        i++;
        if (i === 3) {
          throw new Error('foo');
        }
      }
    };

    await timer.lifecycle.startup(args);
    const e = await timer.lifecycle.onShutdown.catch(e => e);
    assert(e instanceof Error);
    assert.equal(timer.lifecycle.isActive(), false);
  }
}

export default TimerTests;
