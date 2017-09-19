import * as Koa             from 'koa';
import * as Router          from 'koa-router';
import * as KoaBodyParser   from 'koa-bodyparser';

import * as logger          from '@nodeswork/logger';
import { NodesworkError }   from '@nodeswork/utils';

import { Injectable }       from '../injection';
import {
  AppMiddlewareProvider,
  Middleware,
  RouterMiddlewareProvider,
}                           from '../middleware';

const LOG = logger.getLogger();

@Middleware()
export class BodyParserMiddleware implements AppMiddlewareProvider {

  appMiddleware() {
    return KoaBodyParser();
  }
}

@Middleware()
export class CoreMiddleware implements AppMiddlewareProvider {

  appMiddleware() {
    return async (ctx: Koa.Context, next: () => void) => {
      try {
        await next();
      } catch (e) {
        const err = NodesworkError.cast(e);
        ctx.status = err.meta.responseCode;
        ctx.body = err.toJSON();

        if (err.meta.responseCode >= 500) {
          LOG.error('5xx in request', err.toJSON({ cause: true, stack: true }));
        } else if (err.meta.responseCode >= 400){
          LOG.warn('4xx in request', err.toJSON());
        }
      }
    };
  }
}

@Middleware({
  later: true,
})
export class UncaughtRequestMiddleware implements RouterMiddlewareProvider {

  routerMiddleware() {
    return {
      methods: [ 'GET', 'POST', 'PUT', 'DELETE' ],
      path: /(.*)/,
      middlewares: handleUncaughtRequest,
    };
  }
}

function handleUncaughtRequest(ctx: Router.IRouterContext) {
  throw NodesworkError.notFound(undefined, {
    path:   ctx.request.path,
    method: ctx.request.method,
  });
}
