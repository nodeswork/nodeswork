import { Handler }           from '../handler';
import { ModuleService }     from '../services/module.service';
import { InjectionMetadata } from '../injection';

@Handler({
  path: '/sstruct',
})
export class ServiceStuctureHandler implements Handler<object> {

  constructor(
    private modules: ModuleService,
  ) { }

  handle() {
    return {
      handlers: this.modules.getRegisterdHandlers(),
      workers: this.modules.getRegisterdWorkers(),
      services: this.modules.getRegisterdServices(),
    };
  }
}
