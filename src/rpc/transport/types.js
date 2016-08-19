/* @flow */

import type {
  RpcRequest,
  RpcResponse
} from '../index.js';

export interface Codec {
  encodeRequest(req: RpcRequest<any>): Buffer;
  decodeResponse(buff: Buffer): RpcResponse<any, any>;
  decodeRequest(buff: Buffer): RpcRequest<any>; // TODO
  encodeResponse(res: RpcResponse<any, any>): Buffer;
}
