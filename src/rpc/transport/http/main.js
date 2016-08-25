/* @flow */

import url from 'url';

import type {
  RpcService
} from '../../index.js';

import ClientFilter from './ClientFilter.js';

import SimpleHttpClient from '../../../http/SimpleHttpClient.js';

import SimpleJsonCodec from '../SimpleJsonCodec.js';

import { applyFilter } from '../../../service/util.js';

export async function createSimpleHttpRpcClient(baseUrl: string): Promise<RpcService> {
  const parsedUrl = url.parse(baseUrl);

  const { hostname, port, protocol } = parsedUrl;

  if (!hostname) {
    throw new Error(`url contains no host: ${baseUrl}`);
  }

  if (!protocol) {
    throw new Error(`url contains no protocol: ${baseUrl}`);
  }

  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error(`protocol should be http or https: ${baseUrl}`);
  }

  let numberPort;

  if (port) {
    numberPort = parseInt(port, 10);
    if (!isFinite(numberPort)) {
      throw new Error(`invalid port: ${baseUrl}`);
    }
  } else {
    numberPort = protocol === 'http:' ? 80 : 443; // TODO DRY
  }

  const httpClient = new SimpleHttpClient({
    hostname,
    port: numberPort,
    secure: protocol === 'https:'
  });

  const codec = new SimpleJsonCodec();
  const filter = new ClientFilter({ codec, path: '/simple-json' });

  // TODO add filters on top of http

  return applyFilter(httpClient, filter);
}
