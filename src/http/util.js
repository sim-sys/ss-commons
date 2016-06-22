/* @flow */

import type {
  HttpHeaders,
  HttpRequest,
  HttpMethod
} from './types.js';

import type {
  Readable
} from 'stream';

import type http from 'http';

import Signal from '../async/Signal.js';

export function normalizeHeaders(headers: HttpHeaders): HttpHeaders {
  const normalizedHeaders: HttpHeaders = {};
  const keys = Object.keys(headers);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const normalizedKey = key.toLowerCase();
    normalizedHeaders[normalizedKey] = headers[key];
  }

  return normalizedHeaders;
}


// TODO max length
export async function bufferReadableStream(stream: Readable): Promise<Buffer> {
  const r = new Signal();

  const buffers: Array<Buffer> = [];

  stream.on('error', e => {
    r.fail(e);
  });

  stream.on('data', buffer => {
    buffers.push(buffer);
  });

  stream.on('end', () => r.emit());

  await r.wait();

  return Buffer.concat(buffers);
}

const methodMap: { [key: string]: ?HttpMethod } = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

export function parseMethod(str: string): ?HttpMethod {
  return methodMap[str.toUpperCase()];
}

// TODO max length
export async function makeBufferedRequest(
  request: http.IncomingMessage
): Promise<?HttpRequest<Buffer>> {
  const method = parseMethod(request.method);

  if (!method) {
    return null;
  }

  const headers = request.headers;
  const url = request.url;

  const body = await bufferReadableStream(request);

  return {
    method,
    headers,
    url,
    body
  };
}


export function cloneReqWithBody<A, B>(
  req: HttpRequest<A>,
  body: B
): HttpRequest<B> {
  const {
    method,
    headers,
    url
  } = req;

  return {
    method,
    headers,
    url,
    body
  };
}
