/* @flow */

import type {
  RpcRequest,
  RpcResponse
} from '../index.js';

// TODO ideally, we should lookup some metadata on schema
class SimpleJsonCodec {
  encodeRequest(req: RpcRequest<any>): Buffer {
    return new Buffer(JSON.stringify(req));
  }

  decodeResponse(buff: Buffer): RpcResponse<any, any> {
    return JSON.parse(buff.toString()); // TODO validate
  }

  decodeRequest(buff: Buffer): RpcRequest<any> {
    return JSON.parse(buff.toString()); // TODO validate
  }

  encodeResponse(res: RpcResponse<any, any>): Buffer {
    return new Buffer(JSON.stringify(res));
  }
}

export default SimpleJsonCodec;
