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

type ReqIn = RpcRequest<any>;
type ResOut = RpcResponse<any, any>;
type ReqOut = HttpRequest<?Buffer>;
type ResIn = HttpResponse<?Buffer>;

type Deps = {
  codec: Codec,
  path: string
};

class ClientHttpRpcFilter {
  _codec: Codec;
  _path: string;

  constructor(deps: Deps) {
    this._codec = deps.codec;
    this._path = deps.path;
  }

  async apply(req: ReqIn, context: Context, service: Service<ReqOut, ResIn>): Promise<ResOut> {
    const codec = this._codec;
    const path = this._path;
    const body = codec.encodeRequest(req);

    const httpReq = {
      method: 'POST',
      url: path,
      headers: {}, // TODO content-type
      body
    };

    const httpRes = await service.call(httpReq, context);

    // TODO check status
    // TODO check content type
    const res = codec.decodeResponse(httpRes.body || new Buffer('')); // TODO

    return res;
  }
}

export default ClientHttpRpcFilter;
