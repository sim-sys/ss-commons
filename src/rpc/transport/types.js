/* @flow */

import type {
  RpcRequest,
  RpcResponse
} from '../index.js';

export interface Codec {
  encodeRequest(req: RpcRequest<any>): Buffer;
  decodeResponse(res: RpcResponse<any, any>): Buffer;
  decodeRequest(buff: Buffer): RpcRequest<any>; // TODO
}
