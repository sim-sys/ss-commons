/* @flow */

import http from 'http';

import {
  expect
} from 'chai';

import Signal from '../../async/Signal.js';
import { bufferReadableStream } from '../util.js';

import SimpleHttpClient from '../SimpleHttpClient.js';

const PORT = 11111;

describe('SimpleHttpClient', () => {
  it('should work', async () => {
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

    expect(rep.statusCode).to.be.equal(401);
    expect((rep.body: any).toString()).to.be.equal('Hello');
    expect(rep.headers['content-type']).to.be.equal('text/plain');

    expect(serverReq.method).to.be.equal('POST');
    expect(serverReq.headers.foo).to.be.equal('bar');
    expect(serverReq.headers['content-length']).to.be.equal('3');
    expect(serverReq.url).to.be.equal('/foobar');
    expect(serverBody.toString()).to.be.equal('foo');

    expect(serverReq.headers['connection']).to.be.equal('keep-alive');
    expect(socketClosed).to.be.equal(false);
  });
});
