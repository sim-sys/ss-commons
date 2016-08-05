/* @flow */

import type { Service } from '../service/index.js';

export type RpcRequest<P> = {
  method: string,
  payload: P
};

export type RpcResponse<R, E> =
  | {
      success: true,
      result: R
    }
  | {
      success: false,
      error: E
    }
;


export type RpcMethod<P, R, E> = Service<RpcRequest<P>, RpcResponse<R, E>>;
