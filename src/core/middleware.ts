import * as Koa           from 'koa';
import * as Router        from 'koa-router';
import { Injectable }     from './injection';

export interface AppMiddlewareProvider {
  appMiddleware(): Koa.Middleware;
}

export interface RouterMiddlewareProvider {
  routerMiddleware(): RouterMiddlewareResult;
}

export type RouterMiddlewareResult = Router.IMiddleware | {
  path:         string|RegExp;
  methods:      string[];
  middlewares:  Router.IMiddleware | Router.IMiddleware[];
};

export type MiddlewareProvider =
  AppMiddlewareProvider | RouterMiddlewareProvider;

export function isAppMiddlwareProvider(
  provider: MiddlewareProvider
): provider is AppMiddlewareProvider {
  return (<AppMiddlewareProvider>provider).appMiddleware != null;
}

export function isRouterMiddlwareProvider(
  provider: MiddlewareProvider
): provider is RouterMiddlewareProvider {
  return (<RouterMiddlewareProvider>provider).routerMiddleware != null;
}

export const MIDDLEWARE = 'ROUTER_MIDDLEWARE';

export function Middleware(options: MiddlewareOptions = {}) {
  const injectable = Injectable({ meta: options });
  return injectable;
}

export interface MiddlewareOptions {
  later?: boolean;
}
