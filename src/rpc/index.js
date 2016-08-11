/* @flow */

import type {
  Service
} from '../service/index.js';

import type {
  MethodType
} from './types';

export type RpcRequest<P> = {
  method: string,
  type: MethodType,
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

export type RpcService = Service<RpcRequest<any>, RpcResponse<any, any>>; // TODO
