/* @flow */

import fs from 'fs';
import path from 'path';
import type {
  HttpRequest,
  HttpResponse
} from './index.js';

const mimeTypes: { [key: string]: ?string } = {
  '.js': 'application/javascript',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css'
};

// not suitable for serious usage
type Deps = {
  root: string
};

function readFile(absolutePath: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(absolutePath, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
}


function tryFile(absolutePath: string): Promise<?Buffer> {
  return readFile(absolutePath).then(() => null);
}

async function magicReadFile(absolutePath: string): Promise<?[Buffer, string]> {
  const ext = path.extname(absolutePath);

  if (ext) {
    const buffer = await tryFile(absolutePath);
    return buffer ? [buffer, ext] : null;
  }

  const html = await tryFile(path.join(absolutePath, 'index.html'));

  if (html) {
    return [html, '.html'];
  }

  const htm = await tryFile(path.join(absolutePath, 'index.html'));

  if (htm) {
    return [htm, '.htm'];
  }

  return null;
}

class StaticHttpService {
  deps: Deps;

  constructor(deps: Deps) {
    this.deps = deps;
  }

  async call(req: HttpRequest<Buffer>): Promise<HttpResponse<Buffer>> {
    const url = req.url; // TODO handle incorrect path
    const { root } = this.deps;

    if (url[0] !== '/') {
      return {
        statusCode: 400,
        headers: {},
        body: new Buffer('Invalid request')
      };
    }


    const absolutePath = path.join(root, url);
    const result = await magicReadFile(absolutePath);

    if (!result) {
      return {
        statusCode: 404,
        headers: {},
        body: new Buffer('Not found')
      };
    }

    const [body, ext] = result;
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    return {
      statusCode: 200,
      headers: {
        'content-type': contentType
      },
      body
    };
  }

}

export default StaticHttpService;
