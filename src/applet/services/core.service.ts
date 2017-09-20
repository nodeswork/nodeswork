import * as logger from '@nodeswork/logger';

import * as kiws   from '../../kiws';

const LOG = logger.getLogger();

@kiws.Service()
export class CoreService {

  constructor(
    private koa: kiws.KoaService,
  ) {
    this.koa.app.listen(28900);
    LOG.info('server is start', { url: 'http://localhost:28900' });
  }
}
