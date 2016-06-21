/* @flow */

const noop = () => {};

// Signal is basically deferred
class Signal<T> {
  _promise: Promise<T>;
  _resolve: (val: T) => void;
  _reject: (err: Error) => void;

  constructor() {
    const promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });

    // prevent unhandled rejections from showing up
    promise.catch(noop);

    this._promise = promise;
  }

  wait(): Promise<T> {
    return this._promise;
  }

  emit(val: T) {
    this._resolve(val);
  }

  fail(err: Error) {
    this._reject(err);
  }

  // TODO this doesn't really work with T other than void
  toCallback(d: T): (err: ?Error, r: ?T) => void {
    return (err: ?Error, r: ?T) => {
      if (err) {
        this.fail(err);
      } else {
        this.emit(r || d);
      }
    };
  }
}

export default Signal;
