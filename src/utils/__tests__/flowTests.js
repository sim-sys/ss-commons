/* @flow */

import {
  expect
} from 'chai';

import {
  unwrap
} from '../flow.js';

describe('utils/flow', () => {
  describe('unwrap', () => {
    it('should unwrap optional values', () => {
      const obj = {};
      const maybeObj: ?{} = obj;

      const unwrappedObj = unwrap(maybeObj);

      expect(unwrappedObj).to.be.equal(obj);
    });

    it('should throw on absent values', () => {
      const maybeObj: ?{} = null;

      expect(() => unwrap(maybeObj)).to.throw(Error);
    });
  });
});
