/* @flow */

import type {
  Process,
  Parser
} from './types.js';

class Config {
  _process: Process;
  _args: { [key: string]: ?string };

  constructor(process: Process) {
    this._process = process;
    this._args = {};
  }

  getFromArgs<T>(key: string, parser: Parser<T>): T {
    const val = this._args[key];

    if (!val) {
      throw new Error(`Argument '${key}' is not specified`);
    }

    const parsed = parser.parse(val);

    if (!parsed) {
      throw new Error(`Argument '${key}' is invalid`);
    }

    return parsed;
  }

}
