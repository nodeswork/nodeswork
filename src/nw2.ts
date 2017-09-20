require('source-map-support').install()

import * as applet from './applet';
import * as kiws   from './kiws';

@applet.Worker()
class MyWorker implements applet.Worker<string> {

  work() {
    return 'work is done';
  }
}

@kiws.Module({
  providers: [
    MyWorker,
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

kiws.bootstrap(AModule, kiws.CoreModule);
