/* @flow */

import { EventEmitter } from 'events';

import {
  expect
} from 'chai';

import {
  almostRunApp
} from '../runApp.js';

import Lifecycle from '../../lifecycle/Lifecycle.js';


class MockProcess extends EventEmitter {
  exit(code?: number) {}
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
