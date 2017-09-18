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
import { ContextInput }   from './inputs';

@NwModule({
  providers: [
    ContextInput,
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
