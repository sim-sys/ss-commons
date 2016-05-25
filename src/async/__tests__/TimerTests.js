/* @flow */

import {
  expect
} from 'chai';

import Timer from '../Timer.js';
import {
  startup,
  shutdown,
  isActive
} from '../../lifecycle/api.js';

describe('Timer', () => {
  it('should work', async () => {
    const timer = new Timer();
    expect(timer).to.be.an.instanceOf(Timer);
  });

  it('should run task periodically', async () => {
    const timer = new Timer();
    let i = 0;
    const args = {
      interval: 1,
      fn: () => {
        i++;
        if (i === 3) {
          shutdown(timer);
        }
      }
    };

    const s = await startup(timer, args);

    await s.wait();

    expect(i).to.be.equal(3);
  });

  it('should stop on error', async () => {
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

    const s = await startup(timer, args);
    const e = await s.wait().catch(e => e);
    expect(e).to.be.an.instanceOf(Error);
    expect(isActive(timer)).to.be.equal(false);
  });
});