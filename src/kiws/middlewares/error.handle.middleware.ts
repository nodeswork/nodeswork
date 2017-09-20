import * as Koa                              from 'koa';

import * as logger                           from '@nodeswork/logger';
import { NodesworkError }                    from '@nodeswork/utils';

import { AppMiddleware, MiddlewareProvider } from '../middleware';

const LOG = logger.getLogger();

@MiddlewareProvider()
export class ErrorHandleMiddleware {

  @AppMiddleware()
  private handleError = async(ctx: Koa.Context, next: () => void) => {
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

  @AppMiddleware({ later: true })
  private uncaughtRequest = async(ctx: Koa.Context) => {
    throw NodesworkError.notFound(undefined, {
      path:   ctx.request.path,
      method: ctx.request.method,
    });
  };
}
