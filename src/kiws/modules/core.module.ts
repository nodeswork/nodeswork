import * as logger       from '@nodeswork/logger';

import { Module }        from '../module';
import {
  KoaService,
  ModuleService,
}                        from '../providers';
import {
  BodyParserMiddleware,
  ErrorHandleMiddleware,
}                        from '../middlewares';
import {
  ServiceHandler,
}                        from '../handlers';
import {
  ContextInput,
  ContextInputProvider,
}                        from '../inputs';

const LOG = logger.getLogger();

@Module({
  middlewares: [
    BodyParserMiddleware,
    ErrorHandleMiddleware,
  ],
  handlers: [
    ServiceHandler,
  ],
  inputs: [
    ContextInputProvider,
  ],
  providers: [
    ContextInput,
    ModuleService,
    KoaService,
  ],
})
export class CoreModule {

  constructor(
    private koa: KoaService,
  ) {
    this.koa.app.listen(28900);
    LOG.info('server is start', { url: 'http://localhost:28900' });
  }
}
