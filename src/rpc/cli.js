/* @flow */

import path from 'path';
import fs from 'fs';

import {
  parseServiceDefinition
} from './dsl.js';

import {
  generateServiceFile
} from './codegen.js';

const serviceDefPath = process.argv[2];

if (!serviceDefPath) {
  throw new Error('service path is not defined');
}

const absPath = path.isAbsolute(serviceDefPath) ?
  serviceDefPath :
  path.resolve(process.cwd(), serviceDefPath);

const defStr = fs.readFileSync(absPath).toString();


const r = parseServiceDefinition(defStr);

if (!r.ok) {
  console.error(r.r.message);
  process.exit(-1);
  throw new Error(); // flow needs this
}

console.log(generateServiceFile(r.v));
