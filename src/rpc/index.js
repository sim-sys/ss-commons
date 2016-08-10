/* @flow */

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
