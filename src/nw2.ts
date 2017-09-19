import * as core from './core';

@core.Worker()
class MyWorker implements core.Worker<string> {

  work() {
    return 'work is done';
  }
}

@core.NwModule({
  workers: [
    MyWorker,
  ],
  providers: [
    {
      provide:   core.MIDDLEWARE,
      useClass:  core.UncaughtRequestMiddleware,
      multi:     true,
    },
  ],
})
class AModule {
}

core.bootstrap(AModule);
