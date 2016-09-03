/* @flow */

class MockClock {
  ts: number;

  constructor(ts: number) {
    this.ts = ts;
  }

  getCurrentTimeMS(): number {
    return this.ts;
  }
}

export default MockClock;
