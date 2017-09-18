import { NwModule }          from './module';
import {
  AppletInfoService,
  CoreService,
  KoaService,
  ModuleService,
}                            from './services';
import {
  RegisterAppletInfoHandler,
  ServiceStatsHandler,
  ServiceStuctureHandler,
}                            from './handlers';
import { ContextInput }      from './inputs';
import {
  ContextLogger,
}                            from './providers';

@NwModule({
  providers: [
    AppletInfoService,
    ContextInput,
    ContextLogger,
    CoreService,
    KoaService,
    ModuleService,
  ],
  workers: [
  ],
  handlers: [
    RegisterAppletInfoHandler,
    ServiceStatsHandler,
    ServiceStuctureHandler,
  ],
  bootstrap: [
    CoreService,
  ],
})
export class CoreModule {
}
