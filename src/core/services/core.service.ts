import * as logger    from '@nodeswork/logger';

import { Service }    from '../service';
import { KoaService } from './koa.service';

const LOG = logger.getLogger();

@Service()
export class CoreService {

  constructor(
    private koa: KoaService,
  ) {

    this.koa.app
      .use(this.koa.router.routes())
      .use(this.koa.router.allowedMethods())
      .listen(28900);
    LOG.info('server is start', { url: 'http://localhost:28900' });
  }
}
