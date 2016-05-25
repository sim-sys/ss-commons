/* @flow */

import type {
  Facility
} from '../lifecycle/types.js';

import {
  startup,
  shutdown
} from '../lifecycle/api.js';

let running = false;

async function actuallyRunApp(app: Facility) {
  function shutdownApp() {
    // TODO handle errors
    shutdown(app);
  }

  process.once('SIGTERM', shutdownApp);
  process.once('SIGINT', shutdownApp);
  process.once('uncaughtException', shutdownApp);
  process.once('unhandledRejection', shutdownApp);

  const s = await startup(app); // TODO cli args?

  try {
    await s.wait();
  } catch (e) {
    // TODO log
    process.exit(-1);
  }

  process.exit(0);
}


export function runApp(app: Facility) {
  if (running) {
    throw new Error('Only one app per process is allowed');
  }
  running = true;
  actuallyRunApp(app);
}
