/* @flow */

import type {
  Filter,
  Service
} from './types.js';

import type Context from './Context.js';

export function applyFilter<ReqIn, RepOut, ReqOut, RepIn>(
  service: Service<ReqOut, RepIn>,
  filter: Filter<ReqIn, RepOut, ReqOut, RepIn>
): Service<ReqIn, RepOut> {
  return {
    call(req: ReqIn, ctx: ?Context): Promise<RepOut> {
      return filter.apply(req, ctx, service);
    }
  };
}
