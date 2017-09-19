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
  BodyParserMiddleware,
  ContextLogger,
  CoreMiddleware,
}                            from './providers';
import {
  MIDDLEWARE,
}                            from './middleware';

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
      useClass:  BodyParserMiddleware,
      multi:     true,
    },
    {
      provide:   MIDDLEWARE,
      useClass:  CoreMiddleware,
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
