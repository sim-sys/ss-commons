/* @flow */

import type { HttpClient } from '../http/types.js';
import SimpleHttpClient from '../http/SimpleHttpClient.js';

type Config = {
  hostname: string,
  port: number
};

/// Low level Consul client
class ConsulClient {
  httpClient: HttpClient<?Buffer, ?Buffer>;
  config: Config;

  constructor(config: Config) {
    this.config = config;

    const { hostname, port } = config;

    this.httpClient = new SimpleHttpClient({ hostname, port });
  }

  async getKV(path: string): Promise<?string> {
    const url = `/v1/kv/${path}`; // TODO encode url?
    const req = { headers: {}, method: 'GET', url, body: null };
    const rep = await this.httpClient.call(req);

    if (rep.statusCode === 404) {
      return null;
    }

    if (rep.statusCode !== 200) {
      throw new Error(`Unexpected status: ${rep.statusCode}`);
    }

    if (!rep.body) {
      throw new Error('Response has no body');
    }

    return rep.body.toString();
  }

}

export default ConsulClient;
