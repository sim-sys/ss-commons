/* @flow */

import http from 'http';
import https from 'https';

import type {
  IncomingMessage
} from 'http';

import Signal from '../async/Signal.js';

import type {
  HttpHeaders,
  HttpRequest,
  HttpResponse
} from './types.js';

import {
  normalizeHeaders,
  bufferReadableStream
} from './util.js';

type Config = {
  hostname: string,
  port: number,
  secure: boolean
};

type MaybeConfig = {
  hostname: string,
  port?: number,
  secure?: boolean
};

function parseConfig(config: MaybeConfig): Config {
  let {
    port,
    secure
  } = config;

  if (typeof secure !== 'boolean') {
    secure = false;
  }

  if (typeof port !== 'number') {
    port = secure ? 443 : 80;
  }


  return {
    hostname: config.hostname,
    port,
    secure
  };
}

// TODO this should have a lifecycle
// i.e. there should be a way to wait until all
// requests are done and shutdown all sockets
// also it's possible to establish a pool of keepalive sockets at
// startup eagerly
class SimpleHttpClient {
  config: Config;
  _agent: any; // TODO add proper type

  constructor(config: MaybeConfig) {
    this.config = parseConfig(config);
    this._agent = this.config.secure ?
      new (https: any).Agent() :
      new (http: any).Agent({ keepAlive: true });
  }

  async call(req: HttpRequest<?Buffer>): Promise<HttpResponse<?Buffer>> {
    const s: Signal<IncomingMessage> = new Signal();

    const headers: HttpHeaders = normalizeHeaders(req.headers);

    if (req.body && req.body.length > 0 && !headers['content-length']) {
      headers['content-length'] = req.body.length + '';
    }

    const { hostname, port } = this.config;

    const opts = {
      hostname,
      port,
      method: req.method,
      path: req.url,
      headers,
      agent: this._agent
    };

    const nodeReq = http.request(opts, res => s.emit(res));

    const errS: Signal<void> = new Signal();
    let error = null;

    nodeReq.once('error', (err: Error) => {
      errS.emit();
      error = err;
    });


    if (req.body && req.body.length > 0) {
      nodeReq.write(req.body);
    }

    nodeReq.end();

    const nodeRes = await Promise.race([
      s.wait(),
      errS.wait()
    ]);

    if (!nodeRes) {
      if (error) {
        throw error;
      } else {
        throw new Error('unknown error');
      }
    }

    // TODO limit max body size
    const body = await bufferReadableStream(nodeRes);

    return {
      statusCode: nodeRes.statusCode,
      headers: nodeRes.headers,
      body
    };
  }
}

export default SimpleHttpClient;
