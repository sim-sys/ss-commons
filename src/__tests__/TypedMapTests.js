/* @flow */

import assert from 'assert';

import TypedMap from '../TypedMap.js';

class TypedMapTests {
  testTypedMap() {
    const map = new TypedMap();
    const key: { t?: number } = {};
    map.setValue(key, 3);

    const val = map.getValue(key);

    assert.equal(val, 3);
  }

  testTypedMapHas() {
    const map = new TypedMap();
    const key: { t?: number } = {};
    map.setValue(key, 3);
    assert(map.has(key));
  }

  testTypedMapDelete() {
    const map = new TypedMap();
    const key: { t?: number } = {};
    map.setValue(key, 3);
    map.deleteValue(key);
    assert(!map.has(key));
  }
}

export default TypedMapTests;
