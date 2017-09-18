import { Handler }       from '../handler';

@Handler({
  path: '/sstats',
})
export class ServiceStatsHandler implements Handler<object> {

  constructor() { }

  handle() {
    return {
      stats: 'ok',
    };
  }
}
