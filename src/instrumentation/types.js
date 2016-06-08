/* @flow */

interface Counter<Labels> {
  inc(labels: Labels, count?: number): void
}

interface Gauge<Labels> {
  inc(count?: number): void,
  dec(count?: number): void,
  set(count?: number): void
}

interface Histogram<Labels> {
  observe(val: number): void
}
