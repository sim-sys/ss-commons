/* @flow */

import type {
  HttpRequest,
  HttpResponse
} from '../types.js';

import {
  cloneReqWithBody
} from '../util.js';

import type Context from '../../service/Context.js';
import type {
  Service
} from '../../service/types.js';

class ParseJsonBodyFilter<T> {
  apply(
    req: HttpRequest<Buffer>,
    ctx: ?Context,
    service: Service<HttpRequest<mixed>, HttpResponse<T>>
  ): Promise<HttpResponse<T>> {
    const body = req.body;
    let parsedBody: mixed = null;

    try {
      parsedBody = JSON.parse(body.toString());
    } catch(e) {
      // respond with 400
    }

    return service.call(cloneReqWithBody(req, parsedBody), ctx);
  }
}

export interface Filter<ReqIn, RepOut, ReqOut, RepIn> {
  apply(req: ReqIn, context: ?Context, service: Service<ReqOut, RepIn>): Promise<RepOut>
}
