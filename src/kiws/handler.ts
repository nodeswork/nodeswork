import 'reflect-metadata';

import * as _                      from 'underscore';

import { Constructor, Injectable } from './injection';

export const HANDLER         = 'HANDLER';

const HANDLER_TAGS           = [ 'handler' ];
const ENDPOINT_METADATA_KEY  = Symbol('kiws:endpoint');

/**
 * Handler class decorator will register the endpoints declared in the provider
 * to KoaRouter.
 */
export function Handler(options: { tags?: string[], meta?: object } = {}) {
  return (constructor: Constructor) => {
    const endpoints = Reflect.getOwnMetadata(
      ENDPOINT_METADATA_KEY, constructor.prototype,
    );
    const injectable = Injectable({
      inputs:  true,
      tags:    _.union(HANDLER_TAGS, options.tags || []),
      meta:    _.extend({}, options.meta, { endpoints }),
    });
    injectable(constructor);
    (constructor as any).prototype.$getEndpoints = $getEndpoints;
  };
}

export interface EndpointOptions {
  method?:  string | string[];
  path:     string;
}

export interface EndpointMetadata extends EndpointOptions {
  name:     string;
  handler:  string;
}

export function Endpoint(options: EndpointOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const endpoints: EndpointMetadata[] =
      Reflect.getOwnMetadata(ENDPOINT_METADATA_KEY, target) || [];
    endpoints.push(_.extend({}, options, {
      name: propertyKey,
      handler: target.constructor.name,
    }));
    Reflect.defineMetadata(ENDPOINT_METADATA_KEY, endpoints, target);
  }
}

export interface Handler extends Constructor {
  $getEndpoints(): EndpointMetadata[];
}

function $getEndpoints(): EndpointMetadata[] {
  return Reflect.getOwnMetadata(
    ENDPOINT_METADATA_KEY, this.constructor.prototype,
  ) || [];
}
