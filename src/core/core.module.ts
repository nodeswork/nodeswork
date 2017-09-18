import { NwModule }  from './module';
import {
  CoreService,
  KoaService,
  ModuleService,
}                    from './services';
import {
  ServiceStatsHandler
}                    from './handlers';

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
  ],
  bootstrap: [
    CoreService,
  ],
})
export class CoreModule {
}
