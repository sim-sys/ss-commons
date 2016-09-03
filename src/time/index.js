/* @flow */

/// An interface for getting current ms timestamp
/// Different implementations can be used for mocking,
/// caching, time-travel, etc
export interface Clock {
  getCurrentTimeMS(): number
}
