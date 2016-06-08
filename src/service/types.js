/* @flow */

import type Context from './Context.js';

export interface Service<Req, Rep> {
  call(req: Req, ctx: ?Context): Promise<Rep>
}

export interface Filter<ReqIn, RepOut, ReqOut, RepIn> {
  apply(req: ReqIn, context: ?Context, service: Service<ReqOut, RepIn>): Promise<RepOut>
}

export type SimpleFilter<Req, Rep> = Filter<Req, Rep, Req, Rep>;
