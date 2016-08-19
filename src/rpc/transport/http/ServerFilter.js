/* @flow */

import type {
  Codec
} from '../types.js';

import type {
  HttpRequest,
  HttpResponse
} from '../../../http/index.js';

import type {
  RpcRequest,
  RpcResponse
} from '../../index.js';

import type {
  Service,
  Context
} from '../../../service/index.js';

type ReqIn = HttpRequest<Buffer>;
type ResOut = HttpResponse<Buffer>;
type ReqOut = RpcRequest<any>;
type ResIn = RpcResponse<any, any>;

type Deps = {
  codec: Codec,
  path: string
};

class ServerHttpRpcFilter {
  _codec: Codec;
  _path: string;

  constructor(deps: Deps) {
    this._codec = deps.codec;
    this._path = deps.path;
  }

  async apply(req: ReqIn, context: Context, service: Service<ReqOut, ResIn>): Promise<ResOut> {
    const codec = this._codec;
    // TODO check content type
    const rpcReq = codec.decodeRequest(req.body); // TODO check error

    if (req.url !== this._path) {
      return {
        statusCode: 404,
        headers: {},
        body: new Buffer('Not found')
      };
    }

    if (req.method !== 'POST') {
      return {
        statusCode: 405,
        headers: {},
        body: new Buffer('Method is not supported')
      };
    }


    const res = await service.call(rpcReq, context);
    // TODO catch, respond with protocol specific error
    const body = codec.encodeResponse(res);

    return {
      statusCode: 200,
      headers: {}, // TODO content-type
      body
    };
  }
}

export default ServerHttpRpcFilter;
