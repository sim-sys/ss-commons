/* @flow */

// KV
export type KVGetResponse = Array<{
  CreateIndex: number,
  ModifyIndex: number,
  LockIndex: number,
  Key: string,
  Flags: number,
  Value: string,
  Session?: string
}>;

export type KVPutRequest = {
  flags?: number,
  cas?: number,
  acquire?: string,
  release?: string
};

// TXN

// export type TXNPutRequest = Array<
//   {
//     "KV": {
//       "Verb": "<verb>",
//       "Key": "<key>",
//       "Value": "<Base64-encoded blob of data>",
//       "Flags": <flags>,
//       "Index": <index>,
//       "Session": "<session id>"
//     }
//   }
// >
