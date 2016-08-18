/* @flow */

import http from 'http';
import https from 'https';

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

    await Promise.race([
      received.wait(),
      repPromise
    ]);

    const socket = serverRes.socket;

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

    socket.destroy();
    const closeS = new Signal();
    server.close(closeS.toCallback());
    await closeS.wait();
  }

  async testHttpsClient() {
    let serverReq: any = null;
    let serverRes: any = null;
    let socketClosed = false;

    const received = new Signal();

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const options = {
      key: `
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAs1t2ijc7JA8J4lveBF1c8omHKg28vIuIuc3FhJMHMM2a1m2v
rv/uvIADbOTWeINEn4iZN+dzl0vJw/UAy6NvgBmXnHhFA83/TCDCpXP2fcciSjmX
YJNX9ddUp5XqQ5Q0XjjrbI/+rWiU7KhRo9huvHyYXV1RD0C2Uo+0Bj/1gSsXF1Ho
pgiLR5XzYYyT65k28Qp5kYym1c9V2u8guvwXnl/HnhApcb5+4WX136eBu1HX8iq8
M/6jq6otWaI2zuG7Q+9fE05sjVhmUjFWWzBnD5IH9jnnzfIDQcaOrWRxYV1O0UrT
ODC221vQyQyCLFCY+VPsCBL1JKpBkP69OQbMkwIDAQABAoIBAFvP2iJum2ud9yVU
eZYqZMYS+Inidlbd5qOWXiG7Udb9qOFTTLd8c60yqo43pkISkDJKLoSbimRMe4BA
DqQviYg9kYqbVljYPnOt4XXooqlIIpl0WbUqN8C09bTD3SOy3gvNf1YXb/s8qd9r
Wj9RL351GVnRxwjTy4D/5tu8KeRwWfiKjzG2b3sW841402zfqHdFIML6LSyaPxLk
iZr/pe9GXUKGUTZd5uUyIzh1xerueXrVs7tsXyYGKNTMklH+lc58SLQDtiY+mBqn
PBFWCTrqeGB4rjdSfsDVJaBOJOBqnNdY3jhM3VJ8XTdfDxRuQ7US330Ayc9LnIUW
8dsriaECgYEA7EILqxNdJr+gy6kiEef0HAaq/6qftA8JQsaKNIhhweClae5i1BRF
EpFE9XiUDSApUcOo1fwB9s8mf7IgimG+u3rrw4SyMAp/bwWenx63YDzanXYu0qNV
mWVtcq20JarwW/2rZcuRVAxWIeJtoO5JBU+FOSk1QHohitJAQR35eocCgYEAwlg3
QWqzr5tpvAfN+hSXqiO+rbMTClmQuNf9x7nIFRnIzKmi/O78eyd+jX4dFS85diWZ
z2DrCykWcZeX1xvoLpmYYpFLDt0ZgVEI2egPNn5STBtec8IvVmRUqip0J9P55Wlz
AP8FG7GtIxM2l9ZcnTERS+p+TG2RYkgK5JoMpJUCgYEAmDKX57aKvMqYIHstmpFt
vZxCDn/xcAJ7ucvC/sKZD1fT1+EdQ3hnYuW4odXysl30oFrGakt1THT4XSz4L412
XLp8JTFXxQEORQw+uk0EXvf08ZlP4pwcKbygfE8QjW+Idgp9nw876QQlfKCsdQ7s
dYJb1Y4JYycKcq6tfAV+UQMCgYBGHUVyGGjTRiKTb81kF+HPxC2axSxtY3rO9T3d
vKzuz+qdy+W9kwsL82e47HLZnbwBX/dp1fF2iVBLkwF43dyaU1ei2ABYUHRPL0ke
NJaodlKCmq0s3jXt2SyiZ8aYR+W0WqLfDSJup19rdBcSGIg5PeabmPIP6Me2yX8E
kn9VMQKBgQC1TCw5dpzrH6h9ZVS3jQpLD2ekaTyiT5Pi4B2Xx5XrmAdm76XDXd96
iOq7v98Gs3u3AnY6SZj50n1iakLcwz/E1la0myMmu3dZUe5p/+vC5BrAU90KL0vV
K/xzV7vMm2RdojxjIfinLwBracLz42u7GVsm/8tg+cAwTU9RKj1O3g==
-----END RSA PRIVATE KEY-----
      `,
      cert: `
-----BEGIN CERTIFICATE-----
MIIDBjCCAe4CCQDgq6kUZFi3HjANBgkqhkiG9w0BAQUFADBFMQswCQYDVQQGEwJB
VTETMBEGA1UECBMKU29tZS1TdGF0ZTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0
cyBQdHkgTHRkMB4XDTE2MDgxODE0MTcwMloXDTE2MDkxNzE0MTcwMlowRTELMAkG
A1UEBhMCQVUxEzARBgNVBAgTClNvbWUtU3RhdGUxITAfBgNVBAoTGEludGVybmV0
IFdpZGdpdHMgUHR5IEx0ZDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
ALNbdoo3OyQPCeJb3gRdXPKJhyoNvLyLiLnNxYSTBzDNmtZtr67/7ryAA2zk1niD
RJ+ImTfnc5dLycP1AMujb4AZl5x4RQPN/0wgwqVz9n3HIko5l2CTV/XXVKeV6kOU
NF4462yP/q1olOyoUaPYbrx8mF1dUQ9AtlKPtAY/9YErFxdR6KYIi0eV82GMk+uZ
NvEKeZGMptXPVdrvILr8F55fx54QKXG+fuFl9d+ngbtR1/IqvDP+o6uqLVmiNs7h
u0PvXxNObI1YZlIxVlswZw+SB/Y5583yA0HGjq1kcWFdTtFK0zgwtttb0MkMgixQ
mPlT7AgS9SSqQZD+vTkGzJMCAwEAATANBgkqhkiG9w0BAQUFAAOCAQEAqxWNqCni
rtzf6jsv19cdqT4bjhjuvLyJ5ykQXrUpfIEalVyWn4v6PMpNvTrTf5bT571RY7Oq
We3RMv89ao6eyR0ZRAoxoR3AzOyXLDB7G/A+NGMExERI4sxEObZYol8prst3GoqB
Ylg68/CKkYZ7TXnF042HCuPDBlL3iaAWj4jl8LW0UnSh7/JBw8KVwVGoZoXp66Zk
X3u2vLbE5UsfIF+QfoNCPGuG3UfSSEecqk/r778YydADq3QJd+sSsWiqt1NUeHZS
7GfTWyPhremAniV6dkJ3B8bOVrau3S9Hcy7UHeuwOyS21VSW3B022qndBhunvonQ
yGOf0h6eaBV/NA==
-----END CERTIFICATE-----
      `
    };

    const server = https.createServer(options, (req, res) => {
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

    const client = new SimpleHttpClient({ port, hostname, secure: true });

    const repPromise = client.call({
      method: 'POST',
      headers: { foo: 'bar' },
      body: new Buffer('foo'),
      url: '/foobar'
    });

    await Promise.race([
      received.wait(),
      repPromise
    ]);

    await received.wait();

    const socket = serverRes.socket;

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

    socket.destroy();
    const closeS = new Signal();
    server.close(closeS.toCallback());
    await closeS.wait();
  }

  async testConnectionError() {
    const hostname = '127.0.0.1';
    const port = PORT;

    const client = new SimpleHttpClient({ port, hostname });
    const err = await client.call({
      method: 'POST',
      headers: { foo: 'bar' },
      body: new Buffer('foo'),
      url: '/foobar'
    }).catch(e => e);

    assert.equal(err.code, 'ECONNREFUSED');
  }
}

export default SimpleHttpClientTests;
