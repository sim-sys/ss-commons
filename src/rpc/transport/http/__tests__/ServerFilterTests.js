/* @flow */

import assert from 'assert';
import { createEmptyContext } from '../../../../service/index.js';

import ServerFilter from '../ServerFilter.js';

class ServerFilterTests {
  async testServerFilter() {
    let payload: ?Buffer;
    const rpcReq = {
      method: 'fooBar',
      type: 'Unsafe',
      payload: { some: 13 }
    };

    const rpcRes = {
      success: true,
      result: {
        foo: 'bar'
      }
    };

    let codecRes;

    const codec = {
      encodeRequest() {
        throw new Error('encodeRequest should not be called');
      },
      decodeResponse() {
        throw new Error('decodeResponse should not be called');
      },
      decodeRequest(buf) {
        payload = buf;
        return rpcReq;
      },
      encodeResponse(res) {
        codecRes = res;
        return new Buffer('encodedResponse');
      }
    };

    const filter = new ServerFilter({ codec, path: '/test' });
    const context = createEmptyContext();
    const req = {
      url: '/test',
      body: new Buffer('foo'),
      headers: {},
      method: 'POST'
    };

    const service = {
      async call() {
        return rpcRes;
      }
    };

    const response = await filter.apply(req, context, service);

    assert.equal(response.statusCode, 200);
    // TODO content-type
    assert.equal(response.body.toString(), 'encodedResponse');

    assert.deepEqual(payload, new Buffer('foo'));
    assert.deepEqual(codecRes, rpcRes);
  }
}

export default ServerFilterTests;
