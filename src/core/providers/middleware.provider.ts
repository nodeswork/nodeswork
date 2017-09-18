import * as Koa           from 'koa';
import * as Router        from 'koa-router';
import * as KoaBodyParser from 'koa-bodyparser';

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

export class CoreMiddlewares implements AppMiddlewareProvider {

  appMiddleware() {
    return KoaBodyParser();
  }
}
