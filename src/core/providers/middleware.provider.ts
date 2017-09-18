import * as Koa           from 'koa';
import * as Router        from 'koa-router';
import * as KoaBodyParser from 'koa-bodyparser';

import { Injectable }     from '../injection';

export interface AppMiddlewareProvider {
  appMiddleware(): Koa.Middleware;
}

export interface RouterMiddlewareProvider {
  routerMiddleware(): Router.IMiddleware;
}

export type MiddlewareProvider =
  AppMiddlewareProvider | RouterMiddlewareProvider;

export function isAppMiddlwareProvider(
  provider: MiddlewareProvider
): provider is AppMiddlewareProvider {
  return (<AppMiddlewareProvider>provider).appMiddleware != null;
}

export const MIDDLEWARE = 'ROUTER_MIDDLEWARE';

export function Middleware(options: MiddlewareOptions = {}) {
  const injectable = Injectable({ meta: options });
  return injectable;
}

export interface MiddlewareOptions {
  later?: boolean;
}

@Middleware()
export class BodyParserMiddleware implements AppMiddlewareProvider {

  appMiddleware() {
    return KoaBodyParser();
  }
}
