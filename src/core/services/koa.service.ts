import * as Koa                            from 'koa';
import * as Router                         from 'koa-router';

import { Service }                         from '../service';
import { ModuleService }                   from './module.service';
import { Handler, HandlerOptions }         from '../handler';
import { beanProvider, InjectionMetadata } from '../injection';

@Service()
export class KoaService {

  public app:    Koa        = new Koa();
  public router: Router  = new Router();

  constructor(
    private modules: ModuleService,
  ) {
    for (let handlerMeta of this.modules.getRegisterdHandlers()) {
      const meta = handlerMeta.meta as HandlerOptions;
      this.router.register(
        meta.path,
        [meta.method || 'GET'],
        handleMiddleware(handlerMeta),
      );
    }

    this.app
      .use(this.router.routes())
      .use(this.router.allowedMethods())
    ;
  }
}

function handleMiddleware(handlerMeta: InjectionMetadata): Router.IMiddleware {
  return (ctx: Router.IRouterContext) => {
    const instance = beanProvider.getBean(handlerMeta.name) as Handler<any>;
    ctx.body = instance.handle();
  };
}
