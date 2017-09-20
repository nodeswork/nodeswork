import * as kiws from '../kiws';

import {
  AppletInfoService,
  CoreService,
}                            from './services';
import {
  RegisterAppletInfoHandler,
}                            from './handlers';
import { ContextInput }      from './inputs';
// import {
  // BodyParserMiddleware,
  // // ContextLogger,
  // CoreMiddleware,
// }                            from './providers';

@kiws.Module({
  providers: [
    AppletInfoService,
    ContextInput,
    // ContextLogger,
    CoreService,
    // {
      // provide:   kiws.MIDDLEWARE,
      // useClass:  [ BodyParserMiddleware, CoreMiddleware ],
      // multi:     true,
    // },
  ],
  handlers: [
    RegisterAppletInfoHandler,
  ],
})
export class CoreModule {

  constructor(private coreService: CoreService) {}
}
