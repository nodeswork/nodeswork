require('source-map-support').install()

import * as applet from './applet';
import * as kiws   from './kiws';

@applet.WorkerProvider({})
class MyWorker {

  @kiws.Input() twitter: applet.TwitterAccount;

  @applet.Worker({})
  work() {
    return {
      status: 'done',
      target: this.twitter,
    };
  }
}

@applet.Module({
  workers: [
    MyWorker,
  ],
  providers: [
    applet.TwitterAccount,
  ],
})
class AModule {

  constructor() { }
}

applet.bootstrap(AModule);
