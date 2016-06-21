/* @flow */

import type {
  Addr,
  HttpService
} from './types.js';

import type net from 'net';

import Signal from '../async/Signal.js';
import http from 'http';
import { unwrap } from '../core/util.js';
import {
  makeBufferedRequest
} from './util.js';

import Context from '../service/Context.js';

class SimpleHttpServer {
  _nodeServer: http.Server;
  _service: ?HttpService<Buffer, Buffer>;
  _listening: boolean;
  _connections: Array<net.Socket>;
  constructor() {
    this._nodeServer = http.createServer((req, res) => this._onRequest(req, res));
    this._listening = false;
    this._service = null;
  }

  async listen(addr: Addr, service: HttpService<Buffer, Buffer>): Promise<void> {
    if (this._listening) {
      return;
    }

    this._listening = true;
    this._service = service;
    const signal = new Signal();

    this._nodeServer.listen(addr.port, addr.host, signal.toCallback());
    this._nodeServer.on('connection', socket => this._onConnection(socket));
    await signal;
  }

  _onConnection(socket: net.Socket) {
    this._connections.push(socket);
    // TODO on error
    socket.on('close', () => this._onDisconnection(socket));
  }

  _onDisconnection(socket: net.Socket) {
    const i = this._connections.indexOf(socket);

    if (i > -1) {
      this._connections.splice(i, 1);
    }
  }

  async _onRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const service = unwrap(this._service);
    const request = await makeBufferedRequest(req);

    if (!request) {
      // TODO repond with something or close socket
      return;
    }

    const ctx = new Context();
    const response = await service.call(request, ctx);
    // TODO try and 500

    // TODO respond
    console.log(res);
    console.log(response);
  }
}

export default SimpleHttpServer;
