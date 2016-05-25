/* @flow */

import type {
  HttpHeaders
} from './types.js';

export function normalizeHeaders(headers: HttpHeaders): HttpHeaders {
  const normalizedHeaders: HttpHeaders = {};
  const keys = Object.keys(headers);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const normalizedKey = key.toLowerCase();
    normalizedHeaders[normalizedKey] = headers[key];
  }

  return normalizeHeaders;
}
