import * as request          from 'request-promise';

import { Endpoint, Handler } from '../handler';
import { ModuleService }     from '../providers';
import { InjectionMetadata } from '../injection';

@Handler({})
export class ServiceHandler {

  constructor(private modules: ModuleService) { }

  @Endpoint({ path: '/sstats' })
  async stats() {
    let externalAccess = false;
    try {
      await request.get('http://www.google.com');
      externalAccess = true;
    } catch (e) {
    }
    return {
      stats: 'ok',
      externalAccess,
    };
  }

  @Endpoint({ path: '/sstruct' })
  structure() {
    return {
      providers: this.modules.getRegisteredProviders(),
    };
  }
}
