/* @flow */

import type {
  HttpHeaders
} from './types.js';

import type {
  Readable
} from 'stream';

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
