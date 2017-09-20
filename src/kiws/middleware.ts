import 'reflect-metadata';

import * as _                      from 'underscore';
import * as Koa                    from 'koa';
import * as Router                 from 'koa-router';

import { Constructor, Injectable } from './injection';

export const MIDDLEWARE                = 'MIDDLEWARE';

export const MIDDLEWARE_TARGET_APP     = 'app';
export const MIDDLEWARE_TARGET_ROUTER  = 'router';

const MIDDLEWARE_TAGS                  = [ 'middleware', 'provider' ];
const MIDDLEWARE_METADATA_KEY          = Symbol('kiws:middleware');

/**
 * MiddlewareProvider class decorator will register the middlewares declared in
 * the provider to Koa and KoaRouter.
 */
export function MiddlewareProvider(
  options: { tags?: string[], meta?: object } = {},
) {
  const injectable = Injectable({
    inputs:  true,
    tags:    _.union(MIDDLEWARE_TAGS, options.tags || []),
    meta:    options.meta,
  });
  return (constructor: Constructor) => {
    injectable(constructor);
    (constructor as any).prototype.$getMiddlewares = $getMiddlewares;
  };
}

export function AppMiddleware(options: { later?: boolean } = {}) {
  return middleware(_.extend({}, options, { target: MIDDLEWARE_TARGET_APP }));
}

export function RouterMiddleware(options: { later?: boolean } = {}) {
  return middleware(
    _.extend({}, options, { target: MIDDLEWARE_TARGET_ROUTER }),
  );
}

function middleware(metadata: MiddlewareMetadata) {
  return (target: any, propertyName: string) => {
    metadata.name = propertyName;
    metadata.provider = target.constructor.name;
    const metadatas: MiddlewareMetadata[] =
      Reflect.getOwnMetadata(MIDDLEWARE_METADATA_KEY, target) || [];
    metadatas.push(metadata);
    Reflect.defineMetadata(MIDDLEWARE_METADATA_KEY, metadatas, target);
  };
}

export interface MiddlewareMetadata {
  target:    string;
  provider:  string;
  name:      string;
  later:     boolean;
}

export interface Middleware extends MiddlewareMetadata {
  fn:      Router.IMiddleware | Koa.Middleware;
}

export interface MiddlewareProvider {
  $getMiddlewares(): Middleware[];
}

function $getMiddlewares(): Middleware[] {
  const metadatas: MiddlewareMetadata[] = Reflect.getOwnMetadata(
    MIDDLEWARE_METADATA_KEY, this.constructor.prototype
  ) || [];
  const middlewares = _.map(metadatas, (metadata) => {
    return _.extend(metadata, { fn: this[metadata.name] });
  });
  return middlewares;
}
