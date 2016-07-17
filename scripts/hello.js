/* @flow */

import SimpleHttpServer from '../src/http/SimpleHttpServer.js';

async function main() {
  const server = new SimpleHttpServer();
  server._connections = []; // TODO fix
  await server.listen({
    host: '127.0.0.1',
    port: 7777
  }, {
    async call() {
      return {
        statusCode: 200,
        headers: {},
        body: new Buffer('hello world!')
      }
    }
  });
}


main()
  .catch(e => {
    console.log(e);
    process.exit(-1);
  });
