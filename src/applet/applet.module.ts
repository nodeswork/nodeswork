import * as _                           from 'underscore';
import {
  Constructor,
  ConstructorOverride,
  ModuleMetadata as KiwsModuleMetadata,
  Module as KiwsModule,
  HANDLER,
}                                       from '../kiws';
import { WorkerProvider }               from './worker';

export interface ModuleMetadata extends KiwsModuleMetadata {
  workers?: Constructor[];
}

export function Module(moduleMetadata: ModuleMetadata) {
  const kiwsModule = KiwsModule(moduleMetadata);
  return (constructor: Constructor) => {
    kiwsModule(constructor);
    const cc = constructor as any;
    cc.$kiwsConstructors = cc.$constructors;
    cc.$constructors = $constructors;
  };
}

function $constructors(): (Constructor|ConstructorOverride)[] {
  const moduleMetadata: ModuleMetadata = this.$getModuleMetadata();
  const results: (Constructor|ConstructorOverride)[] =
    this.$kiwsConstructors();
  if (moduleMetadata.workers != null) {
    results.push({
      provide:   HANDLER,
      useClass:  moduleMetadata.workers,
      multi:     true,
    });
  }
  return results;
}

// import {
  // AppletInfoService,
  // CoreService,
// }                            from './services';
// import {
  // RegisterAppletInfoHandler,
// }                            from './handlers';
// import { ContextInput }      from './inputs';
// // import {
  // // BodyParserMiddleware,
  // // // ContextLogger,
  // // CoreMiddleware,
// // }                            from './providers';

// @kiws.Module({
  // providers: [
    // AppletInfoService,
    // ContextInput,
    // // ContextLogger,
    // CoreService,
    // // {
      // // provide:   kiws.MIDDLEWARE,
      // // useClass:  [ BodyParserMiddleware, CoreMiddleware ],
      // // multi:     true,
    // // },
  // ],
  // handlers: [
    // RegisterAppletInfoHandler,
  // ],
// })
// export class CoreModule {

  // constructor(private coreService: CoreService) {}
// }
