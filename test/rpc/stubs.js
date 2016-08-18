/* @flow */
/* THIS FILE IS GENERATED AUTOMATICALLY, DON'T EDIT! */
/* eslint-disable */

import type {
  RpcRequest,
  RpcResponse,
  RpcService
} from 'ss-commons/rpc';

import {
  createEmptyContext,
  Context
} from 'ss-commons/service';

// custom types


// methods

// getVal
export type GetValRequest = {
  key: string
};

export type GetValResponse = {
  val: string
};

// putVal
export type PutValRequest = {
  id: string,
  val: string
};

export type PutValResponse = {};

export interface ServiceFacade {
  getVal(request: GetValRequest, ctx: Context): Promise<RpcResponse<GetValResponse, any>>;
  putVal(request: PutValRequest, ctx: Context): Promise<RpcResponse<PutValResponse, any>>;
}

export interface ContextlessServiceFacade {
  getVal(request: GetValRequest): Promise<RpcResponse<GetValResponse, any>>;
  putVal(request: PutValRequest): Promise<RpcResponse<PutValResponse, any>>;
}

class Client {
  _service: RpcService;

  constructor(service: RpcService) {
    this._service = service;
  }

  async getVal(request: GetValRequest, ctx: Context): Promise<RpcResponse<GetValResponse, any>> {
    const req: RpcRequest<{}> = {
      method: 'getVal',
      type: 'Fetch',
      payload: request
    };

    const rep = await this._service.call(req, ctx);
    return rep;
  }

  async putVal(request: PutValRequest, ctx: Context): Promise<RpcResponse<PutValResponse, any>> {
    const req: RpcRequest<{}> = {
      method: 'putVal',
      type: 'Idempotent',
      payload: request
    };

    const rep = await this._service.call(req, ctx);
    return rep;
  }

}

export function createClient(service: RpcService): ServiceFacade {
  return new Client(service);
}

class ContextlessClient {
  _service: RpcService;

  constructor(service: RpcService) {
    this._service = service;
  }

  async getVal(request: GetValRequest): Promise<RpcResponse<GetValResponse, any>> {
    const req: RpcRequest<{}> = {
      method: 'getVal',
      type: 'Fetch',
      payload: request
    };
    const ctx = createEmptyContext();

    const rep = await this._service.call(req, ctx);
    return rep;
  }

  async putVal(request: PutValRequest): Promise<RpcResponse<PutValResponse, any>> {
    const req: RpcRequest<{}> = {
      method: 'putVal',
      type: 'Idempotent',
      payload: request
    };
    const ctx = createEmptyContext();

    const rep = await this._service.call(req, ctx);
    return rep;
  }

}

export function createContextlessClient(service: RpcService): ContextlessServiceFacade {
  return new ContextlessClient(service);
}

class Service {
  _impl: ServiceFacade;

  constructor(impl: ServiceFacade) {
    this._impl = impl;
  }

  call(req: RpcRequest<any>, ctx: Context): Promise<RpcResponse<any, any>> {
    switch (req.method) {
      case 'getVal': return this._impl.getVal(req.payload, ctx);
      case 'putVal': return this._impl.putVal(req.payload, ctx);
    }

    throw new Error('TODO');
  }
}
