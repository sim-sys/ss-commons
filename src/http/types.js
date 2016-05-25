/* @flow */

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
  [key: string]: string
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

export type HttpClient<ReqBody, RepBody> = {
  call(req: HttpRequest<ReqBody>): Promise<HttpResponse<RepBody>>;
};
