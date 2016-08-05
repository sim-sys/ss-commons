/* @flow */

import type {
  RpcRequest,
  RpcResponse,
  RpcMethod
} from './runtime.js';

import type Context from '../service/Context.js';


class RpcService {
  _methods: { [key: string]: ?RpcMethod<any, any, any> };

  constructor() {
    this._methods = {};
  }

  registerMethod(name: string, method: RpcMethod<any, any, any>) {
    this._methods[name] = method;
  }

  async call(
    req: RpcRequest<any>,
    ctx: Context
  ): Promise<RpcResponse<any, any>> {
    const methodName = req.method;

    const method = this._methods[methodName];

    if (!method) {
      throw new Error(); // TODO respond
    }

    return method.call(req, ctx); // TODO try-catch
  }
}

export default RpcService;
