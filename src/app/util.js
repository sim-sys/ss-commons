/* @flow */

import {
  convertToError
} from '../util.js';

interface ProcessLike {
  once(event: string, listener: Function): mixed;
}

export function createShutdownPromise(process: ProcessLike): Promise<void> {
  return new Promise(resolve => {
    process.once('SIGTERM', resolve);
    process.once('SIGINT', resolve);
  });
}


export function createErrorPromise(process: ProcessLike): Promise<Error> {
  return new Promise(resolve => {
    process.once('uncaughtException', (err: mixed) => {
      resolve(convertToError(err));
    });

    process.once('unhandledRejection', (err: mixed) => {
      resolve(convertToError(err));
    });
  });
}
