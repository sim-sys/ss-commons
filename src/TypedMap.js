/* @flow */

type Token<T> = { t?: T };

class TypedMap {
  _store: Map<{}, any>;

  constructor() {
    this._store = new Map();
  }

  // TODO strip *Value, when babel's parser will allow it
  getValue<T>(key: Token<T>): ?T {
    return this._store.get(key);
  }

  setValue<T>(key: Token<T>, val: T) {
    this._store.set(key, val);
  }

  deleteValue<T>(key: Token<T>) {
    this._store.delete(key);
  }

  has<T>(key: Token<T>): boolean {
    return this._store.has(key);
  }
}

export default TypedMap;
