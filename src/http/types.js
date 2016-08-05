/* @flow */

import type {
  Service
} from '../service/index.js';

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'HEAD'
  | 'DELETE'
  | 'OPTIONS'
  | 'CONNECT'
;

export type HttpHeaders = {
  [key: string]: ?(string | Array<string>) // TODO this is not ideal
};

export type HttpRequest<Body> = {
  method: HttpMethod,
  headers: HttpHeaders,
  body: Body,
  url: string
};

export type HttpResponse<Body> = {
  statusCode: number,
  headers: HttpHeaders,
  body: Body
};

export type HttpService<ReqBody, RepBody> = Service<HttpRequest<ReqBody>, HttpResponse<RepBody>>;

export type HttpClient<ReqBody, RepBody> = HttpService<ReqBody, RepBody>;

export type Addr = {
  port: number,
  host: string
};

export type HttpServer<ReqBody, RepBody> = {
  listen(addr: Addr, service: HttpService<ReqBody, RepBody>): Promise<void>
};
