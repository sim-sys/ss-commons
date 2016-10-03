'use strict';

const cp = require('child_process');
const fs = require('fs');

const result = cp.execSync('npm outdated --json').toString();
const parsed = JSON.parse(result);

const packageJSON = require('./package.json');

const whitelist = [
  /^babel\-/,
  /^flow-bin$/
];

Object.keys(packageJSON.dependencies)
  .forEach(key => {
    if (parsed[key] && whitelist.some(r => r.test(key))) {
      packageJSON.dependencies[key] = parsed[key].latest;
    }
  });


fs.writeFileSync('./package.json', JSON.stringify(packageJSON, null, '  '));
