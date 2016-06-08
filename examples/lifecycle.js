/* @flow */

import Lifecycle from '../src/Lifecycle.js';

const ms = 4;
const lifecycle = new Lifecycle((onShutdown) => {
  console.log('Startup');

  setTimeout(() => {
    console.log('Done');
    onShutdown();
  }, ms);
}, () => {

});
