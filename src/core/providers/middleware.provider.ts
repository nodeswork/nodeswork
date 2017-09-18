import * as Koa           from 'koa';
import * as KoaBodyParser from 'koa-bodyparser';

import { Injectable }     from '../injection';
import { AppMiddlewareProvider, Middleware }     from '../middleware';

@Middleware()
export class BodyParserMiddleware implements AppMiddlewareProvider {

  appMiddleware() {
    return KoaBodyParser();
  }
}
