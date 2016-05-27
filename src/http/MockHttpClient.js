/* @flow */

import type {
  HttpRequest,
  HttpResponse
} from './types.js';

class MockHttpClient<ReqBody, ResBody> {
  reps: Array<() => HttpResponse<ResBody>>;
  reqs: Array<HttpRequest<ReqBody>>;

  constructor() {
    this.reqs = [];
    this.reps = [];
  }

  async call(req: HttpRequest<ReqBody>): Promise<HttpResponse<ResBody>> {
    this.reqs.push(req);
    const fn = this.reps.shift();

    if (!fn) {
      throw new Error('no reps');
    }

    return fn();
  }
}

export default MockHttpClient;
