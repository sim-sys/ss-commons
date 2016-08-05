'use strict';

const glob = require('glob');
const path = require('path');

const srcPath = path.join(__dirname, '../src');
const flowPath = path.join(__dirname, 'node_modules/.bin/flow');

const cp = require('child_process');

const files = glob.sync("**/*.js", { cwd: srcPath });

const cwd = path.join(__dirname, '..');

function exec(cmd) {
  return cp.execSync(cmd, { cwd, stdio: ['pipe', 'pipe', 'ignore'] });
}

let totalCovered = 0;
let totalUncovered = 0;

function coverage(c, u) {
  const t = c + u;

  if (t === 0) {
    return 100;
  }

  return Math.floor(100 * (c / t));
}

let failed = false;

for (const file of files) {
  const relativePath = path.join('./src', file);
  const r = exec(`${flowPath} coverage --json ${relativePath}`, { cwd });
  const p = JSON.parse(r);

  const covered = p.expressions['covered_count'];
  const uncovered = p.expressions['uncovered_count'];

  totalCovered += covered;
  totalUncovered += uncovered;

  const cov = coverage(covered, uncovered);

  if (cov !== 100) {
    failed = true;
    console.log(`${file} - ${cov}%`);
  }
}

console.log();
console.log(`Total coverage - ${coverage(totalCovered, totalUncovered)}%`);


if (failed) {
  process.exit(-1);
}
