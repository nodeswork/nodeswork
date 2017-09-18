import { Handler }                       from '../handler';
import { ModuleService }                 from '../services/module.service';
import { InjectionMetadata }             from '../injection';
import { AppletInfo, AppletInfoService } from '../services/applet.info.service';

@Handler({
  path: '/sstruct',
})
export class ServiceStuctureHandler implements Handler<object> {

  constructor(
    private modules: ModuleService,
    private appletInfoService: AppletInfoService,
  ) { }

  handle() {
    return {
      handlers: this.modules.getRegisteredHandlers(),
      workers: this.modules.getRegisteredWorkers(),
      services: this.modules.getRegisteredProviders(),
      appletInfo: this.appletInfoService.getAppletInfo(),
    };
  }
}
