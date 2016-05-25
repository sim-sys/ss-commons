/* @flow */

import {
  expect
} from 'chai';

import type {
  Success as SuccessT,
  Failure as FailureT
} from '../types.js';

import {
  unwrap,
  wrapError,
  Success,
  Failure,
  unwrapResult,
  wrapResult,
  wrapResultAsync
} from '../util.js';

describe('core/util', () => {
  describe('unwrap', () => {
    it('should unwrap optional value', () => {
      const obj = {};
      const maybeObj: ?{} = obj;
      const unwrapped = unwrap(maybeObj);
      expect(unwrapped).to.be.equal(obj);
    });

    it('should throw if value is not present', () => {
      const maybeObj: ?{} = null;
      expect(() => unwrap(maybeObj)).to.throw(Error);
    });
  });

  describe('wrapError', () => {
    it('should pass through instance of Error', () => {
      const err: mixed = new Error();
      const wrapped = wrapError(err);
      expect(wrapped).to.be.equal(err);
    });

    it('should wrap strings', () => {
      const err: mixed = 'foo';
      const wrapped = wrapError(err);
      expect(wrapped).to.be.an.instanceOf(Error);
      expect(wrapped.message).to.be.equal('foo');
    });

    it('should wrap anything else', () => {
      const err: mixed = {};
      const wrapped = wrapError(err);
      expect(wrapped).to.be.an.instanceOf(Error);
      expect(wrapped.message).to.be.equal('Unknown error');
    });
  });

  describe('Success', () => {
    it('should wrap val as Success result', () => {
      const result: SuccessT<number> = Success(4);
      expect(result.success).to.be.equal(true);
      expect(result.val).to.be.equal(4);
    });
  });

  describe('Failure', () => {
    it('should wrap failure', () => {
      const result: FailureT = Failure('FOO_BAR', { foo: 'bar' }, 123);
      expect(result.success).to.be.equal(false);
      expect(result.code).to.be.equal('FOO_BAR');
      expect(result.info).to.be.deep.equal({ foo: 'bar' });
      expect(result.raw).to.be.equal(123);
    });
  });

  describe('unwrapResult', () => {
    it('should return value', () => {
      const result = Success(4);
      const unwrapped = unwrapResult(result);
      expect(unwrapped).to.be.equal(4);
    });

    it('should throw on failure', () => {
      const result = Failure('FOO');
      expect(() => unwrapResult(result)).to.throw(Error);
    });
  });

  describe('wrapResult', () => {
    it('should wrap success', () => {
      const result = wrapResult(() => 4);
      expect(result.success).to.be.equal(true);
      expect((result: any).val).to.be.equal(4);
    });

    it('should wrap failure', () => {
      const err = new Error('foo');
      const result = wrapResult(() => { throw err; });
      expect(result.success).to.be.equal(false);
      expect((result: any).code).to.be.equal('ERROR');
      expect((result: any).raw).to.be.equal(err);
    });
  });

  describe('wrapResultAsync', () => {
    it('should wrap success', async () => {
      const result = await wrapResultAsync(() => Promise.resolve(4));
      expect(result.success).to.be.equal(true);
      expect((result: any).val).to.be.equal(4);
    });

    it('should wrap failure', async () => {
      const err = new Error('foo');
      const result = await wrapResultAsync(() => Promise.reject(err));
      expect(result.success).to.be.equal(false);
      expect((result: any).code).to.be.equal('ERROR');
      expect((result: any).raw).to.be.equal(err);
    });
  });
});
