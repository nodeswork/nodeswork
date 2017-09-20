import * as KoaBodyParser                    from 'koa-bodyparser';

import { AppMiddleware, MiddlewareProvider } from '../middleware';

@MiddlewareProvider()
export class BodyParserMiddleware {

  @AppMiddleware() private bodyParser = KoaBodyParser();
}
