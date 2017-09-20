import { Endpoint, Handler } from '../handler';

@Handler({})
export class ServiceHandler {

  @Endpoint({ path: '/sstats' })
  stats() {
    return {
      stats: 'ok',
    };
  }

  @Endpoint({ path: '/sstruct' })
  structure() {
    return {
      // handlers: this.modules.getRegisteredHandlers(),
      // workers: this.modules.getRegisteredWorkers(),
      // services: this.modules.getRegisteredProviders(),
      // appletInfo: this.appletInfoService.getAppletInfo(),
    };
  }
}
