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
})
class AModule {
}

core.bootstrap(AModule);
