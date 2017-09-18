import * as _                              from 'underscore';
import * as Koa                            from 'koa';
import * as Router                         from 'koa-router';

import * as logger                         from '@nodeswork/logger';

import { Service }                         from '../service';
import { ModuleService }                   from './module.service';
import { Handler, HandlerOptions }         from '../handler';
import { Worker }                          from '../worker';
import { beanProvider, InjectionMetadata } from '../injection';

const LOG = logger.getLogger();

@Service()
export class KoaService {

  public app:    Koa        = new Koa();
  public router: Router  = new Router();

  constructor(
    private modules: ModuleService,
  ) {
    for (let workerMeta of this.modules.getRegisteredWorkers()) {
      const path = `/workers/${workerMeta.name}`;
      const method = 'POST';
      this.router.post(path, workerMiddleware(workerMeta));
      LOG.info('Register router path', {
        path, method, worker: workerMeta.name,
      });
    }

    for (let handlerMeta of this.modules.getRegisteredHandlers()) {
      const meta    = handlerMeta.meta as HandlerOptions;
      const path    = meta.path;
      const method  = meta.method || 'GET';
      this.router.register(path, [method], handleMiddleware(handlerMeta));
      LOG.info('Register router path', {
        path, method, handler: handlerMeta.name,
      });
    }

    this.app
      .use(this.router.routes())
      .use(this.router.allowedMethods())
    ;
  }
}

function workerMiddleware(workerMeta: InjectionMetadata): Router.IMiddleware {
  return async (ctx: Router.IRouterContext) => {
    const inputs = getInputs(ctx);
    const instance = beanProvider.getBean(workerMeta.name, inputs) as Worker<any>;
    ctx.body = await instance.work();
  };
}

function handleMiddleware(handlerMeta: InjectionMetadata): Router.IMiddleware {
  return async (ctx: Router.IRouterContext) => {
    const inputs = getInputs(ctx);
    const instance = beanProvider.getBean(handlerMeta.name, inputs) as Handler<any>;
    ctx.body = await instance.handle();
  };
}

function getInputs(ctx: Router.IRouterContext): object[] {
  const raw = [
    { type: 'ContextInput', data: { ctx } },
  ];

  const injectedInputs = _.map(raw, (input: any) => {
    const { type, data } = input;
    if (type == null) {
      throw new Error('type is missing in input');
    }
    const instance = beanProvider.getBean(type);
    _.extend(instance, data);
    return instance;
  });

  return injectedInputs;
}
