/* @flow */

interface Counter {
  inc(count?: number): void
}

interface Gauge {
  inc(count?: number): void,
  dec(count?: number): void,
  set(count?: number): void
}

interface Histogram {
  observe(val: number): void
}
