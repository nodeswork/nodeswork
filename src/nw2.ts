require('source-map-support').install()

import * as applet from './applet';
import * as kiws   from './kiws';

@applet.WorkerProvider({})
class MyWorker {

  @applet.Worker({})
  work() {
    return 'work is done';
  }
}

@applet.Module({
  workers: [
    MyWorker,
  ],
  providers: [
    // MyWorker,
    // {
      // provide:   kiws.MIDDLEWARE,
      // useClass:  core.UncaughtRequestMiddleware,
      // multi:     true,
    // },
  ],
})
class AModule {

  constructor() { }
}

applet.bootstrap(AModule);
