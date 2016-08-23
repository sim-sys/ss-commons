/* @flow */

import {
  createShutdownPromise,
  createErrorPromise
} from './util.js';

import {
  convertToError
} from '../util.js';

type AppMain = (onShutdown: Promise<?Error>) => Promise<number>;

export function runApp(app: AppMain): void { // TODO support object format
  const shutdownPromise = createShutdownPromise(process);
  const errorPromise = createErrorPromise(process);

  errorPromise.then(logFatal);

  const onShutdown = Promise.race([
    shutdownPromise,
    errorPromise
  ]);

  function logFatal(e: mixed) {
    const err = convertToError(e);

    console.error(`Fatal error: ${err.message}`);
    console.error(`${err.stack}`);
  }


  function onSuccess(exitCode) {
    process.exit(exitCode);
  }

  function onFailure(e: mixed) {
    logFatal(e);
    process.exit(1);
  }

  app(onShutdown)
    .then(onSuccess)
    .catch(onFailure);
}
