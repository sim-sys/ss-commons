/* @flow */

import type Lifecycle from '../Lifecycle.js';

let running = false;

type Process = {
  once(e: string, fn: Function): any,
  exit(code?: number): void
};

type Facility<T> = {
  lifecycle: Lifecycle<T>
};

async function actuallyRunApp(app: Facility<void>, process: Process) {
  function shutdownApp() {
    // TODO handle errors
    app.lifecycle.shutdown();
  }

  process.once('SIGTERM', shutdownApp);
  process.once('SIGINT', shutdownApp);
  process.once('uncaughtException', shutdownApp);
  process.once('unhandledRejection', shutdownApp);

  await app.lifecycle.startup(); // TODO cli args?

  try {
    await app.lifecycle.onShutdown;
  } catch (e) {
    // TODO log
    process.exit(-1);
  }

  process.exit(0);
}


export function almostRunApp(app: Facility, process: Process) {
  if (running) {
    throw new Error('Only one app per process is allowed');
  }
  running = true;
  actuallyRunApp(app, process);
}

function runApp(app: Facility) {
  almostRunApp(app, process);
}

export default runApp;
