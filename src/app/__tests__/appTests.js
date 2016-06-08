/* @flow */

import { EventEmitter } from 'events';

import {
  almostRunApp
} from '../runApp.js';

import Lifecycle from '../../Lifecycle.js';


class MockProcess extends EventEmitter {
  exit() {}
}


describe('app', () => {
  describe('almostRunApp', () => {
    const process = new MockProcess();
    const app = {
      lifecycle: new Lifecycle(() => {})
    };
    almostRunApp(app, process);
  });
});
