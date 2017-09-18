import { NwModule }       from './module';
import {
  CoreService,
  KoaService,
  ModuleService,
}                         from './services';
import {
  ServiceStatsHandler,
  ServiceStuctureHandler,
}                         from './handlers';

@NwModule({
  services: [
    CoreService,
    KoaService,
    ModuleService,
  ],
  workers: [
  ],
  handlers: [
    ServiceStatsHandler,
    ServiceStuctureHandler,
  ],
  bootstrap: [
    CoreService,
  ],
})
export class CoreModule {
}
