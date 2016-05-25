/* @flow */

export type AppMeta = {
  name: string,
  version: string
};


export type App = {
  meta?: AppMeta,
  // standart health check for service registration
  isHealthy?: () => Promise<boolean>,
  getPendingTransactions?: () => number
};
