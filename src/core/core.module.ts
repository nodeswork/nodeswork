import { NwModule }  from './module';
import {
  CoreService,
  KoaService,
  ModuleService,
}                    from './services';
import {
  ServiceStatsWorker
}                    from './workers';

@NwModule({
  services: [
    CoreService,
    KoaService,
    ModuleService,
  ],
  workers: [
    ServiceStatsWorker,
  ],
  bootstrap: [
    CoreService,
  ],
})
export class CoreModule {
}
