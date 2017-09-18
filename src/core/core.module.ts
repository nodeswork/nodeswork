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
  CoreMiddlewares,
  MIDDLEWARE,
}                            from './providers';

@NwModule({
  providers: [
    AppletInfoService,
    ContextInput,
    ContextLogger,
    CoreService,
    KoaService,
    ModuleService,
    {
      provide:   MIDDLEWARE,
      useClass:  CoreMiddlewares,
      multi:     true,
    },
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
