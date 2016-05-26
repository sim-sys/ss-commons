/* @flow */

import type {
  Facility
} from '../lifecycle/types.js';

let running = false;

async function actuallyRunApp(app: Facility<void>) {
  function shutdownApp() {
    // TODO handle errors
    app.lifecycle.shutdown();
  }

  process.once('SIGTERM', shutdownApp);
  process.once('SIGINT', shutdownApp);
  process.once('uncaughtException', shutdownApp);
  process.once('unhandledRejection', shutdownApp);

  const s = await app.lifecycle.startup(); // TODO cli args?

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
