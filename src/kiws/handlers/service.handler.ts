import { Endpoint, Handler } from '../handler';
import { ModuleService }     from '../providers';
import { InjectionMetadata } from '../injection';

@Handler({})
export class ServiceHandler {

  constructor(private modules: ModuleService) { }

  @Endpoint({ path: '/sstats' })
  stats() {
    return {
      stats: 'ok',
    };
  }

  @Endpoint({ path: '/sstruct' })
  structure() {
    return {
      providers: this.modules.getRegisteredProviders(),
    };
  }
}
