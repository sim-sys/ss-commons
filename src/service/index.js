/* @flow */

import Context from './Context.js';

import {
  applyFilter
} from './util.js';

export {
  Context
};

export interface Service<Req, Res> {
  call(req: Req, ctx: Context): Promise<Res>
}

export interface Filter<ReqIn, ResOut, ReqOut, ResIn> {
  apply(req: ReqIn, context: Context, service: Service<ReqOut, ResIn>): Promise<ResOut>
}

export type SimpleFilter<Req, Res> = Filter<Req, Res, Req, Res>;

export function createEmptyContext(): Context {
  return new Context();
}

export {
  applyFilter
};
