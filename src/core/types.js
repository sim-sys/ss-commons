/* @flow */

export type Success<T> = {
  success: true,
  val: T
};

export type Failure = {
  success: false,
  code: string, // static string that represents type of failure, could be a enum in some domain
  info: ?{}, // a collection of values, related to failure
  raw: ?mixed // raw value, such as an instance of Error
}

export type Result<T> =
  | Success<T>
  | Failure
;
