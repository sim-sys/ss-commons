/* @flow */

import http from 'http';

import assert from 'assert';

import Signal from '../../async/Signal.js';
import { bufferReadableStream } from '../util.js';

import SimpleHttpClient from '../SimpleHttpClient.js';

const PORT = 11111;

class SimpleHttpClientTests {
  async testHttpClient() {
    let serverReq: any = null;
    let serverRes: any = null;
    let socketClosed = false;

    const received = new Signal();

    const server = http.createServer((req, res) => {
      serverReq = req;
      serverRes = res;

      req.socket.on('close', () => {
        socketClosed = true;
      });

      received.emit();
    });

    const s = new Signal();
    const hostname = '127.0.0.1';
    const port = PORT;

    server.listen(port, hostname, (err) => {
      if (err) {
        s.fail(err);
      } else {
        s.emit();
      }
    });

    await s.wait();

    const client = new SimpleHttpClient({ port, hostname });
    const repPromise = client.call({
      method: 'POST',
      headers: { foo: 'bar' },
      body: new Buffer('foo'),
      url: '/foobar'
    });

    await received.wait();

    const serverBody = await bufferReadableStream(serverReq);

    serverRes.writeHead(401, { 'Content-Type': 'text/plain' });
    serverRes.end('Hello');

    const rep = await repPromise;

    assert.equal(rep.statusCode, 401);
    assert.equal((rep.body: any).toString(), 'Hello');
    assert.equal(rep.headers['content-type'], 'text/plain');

    assert.equal(serverReq.method, 'POST');
    assert.equal(serverReq.headers.foo, 'bar');
    assert.equal(serverReq.headers['content-length'], '3');
    assert.equal(serverReq.url, '/foobar');
    assert.equal(serverBody.toString(), 'foo');

    assert.equal(serverReq.headers['connection'], 'keep-alive');
    assert.equal(socketClosed, false);
  }
}

export default SimpleHttpClientTests;
