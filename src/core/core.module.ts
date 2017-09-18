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

@NwModule({
  providers: [
    AppletInfoService,
    ContextInput,
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
