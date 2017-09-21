import * as _                      from 'underscore';
import * as Koa                    from 'koa';
import * as Router                 from 'koa-router';

import * as logger                 from '@nodeswork/logger';

import { Service }                 from '../service';
import { ModuleService }           from './module.service';
import { Token, beanProvider }     from '../injection';
import {
  MIDDLEWARE,
  Middleware,
  MiddlewareProvider,
  MIDDLEWARE_TARGET_APP,
  MIDDLEWARE_TARGET_ROUTER,
}                                  from '../middleware';
import {
  HANDLER,
  Handler,
  Endpoint,
  EndpointMetadata,
}                                  from '../handler';
import {
  INPUT,
  Input,
  InputProvider,
}                                  from '../input';

const LOG = logger.getLogger();

@Service()
export class KoaService {

  public app:    Koa     = new Koa();
  public router: Router  = new Router();

  constructor(
    private modules: ModuleService,
    @Token(MIDDLEWARE) private middlewareProviders: MiddlewareProvider[],
    @Token(HANDLER)    private handlers:            Handler[],
    @Token(INPUT)      private inputProviders:      InputProvider[],
  ) {
    const middlewares: Middleware[] = _.flatten(
      _.map(this.middlewareProviders, (provider) => provider.$getMiddlewares())
    );
    this.registerMiddlewaresPre(middlewares);

    this.registerHandlers();

    this.app
      .use(this.router.routes())
      .use(this.router.allowedMethods())
    ;
    this.registerMiddlewaresPost(middlewares);
  }

  private registerHandlers() {
    const self = this;

    function register(handlerName: string, endpoint: EndpointMetadata) {
      _.defaults(endpoint, { method: 'GET' });
      self.router.register(
        endpoint.path,
        _.flatten([ endpoint.method ]),
        async (ctx: Router.IRouterContext) => {
          const inputs: Input[] = _.flatten(_.map(
            self.inputProviders,
            (provider) => provider.$generateInputs(ctx),
          ));
          const handler: Handler = beanProvider.getBean(handlerName, inputs);
          ctx.body = await (handler as any)[endpoint.name]();
        }
      );
      LOG.info('Register router path', endpoint);
    }

    for (const handler of this.handlers) {
      const endpoints = handler.$getEndpoints();
      for (const endpoint of endpoints) {
        register(handler.constructor.name, endpoint);
      }
    }
  }

  private registerMiddlewaresPre(middlewares: Middleware[]) {
    for (const middleware of middlewares) {
      if (middleware.target === MIDDLEWARE_TARGET_APP && !middleware.later) {
        this.app.use(middleware.fn);
        LOG.info(
          'Use App middleware', _.pick(middleware, 'provider', 'name'),
        );
      }
    }

    for (const middleware of middlewares) {
      if (middleware.target === MIDDLEWARE_TARGET_ROUTER && !middleware.later) {
        this.router.use(middleware.fn);
        LOG.info(
          'Use Router middleware', _.pick(middleware, 'provider', 'name'),
        );
      }
    }
  }

  private registerMiddlewaresPost(middlewares: Middleware[]) {
    for (const middleware of middlewares) {
      if (middleware.target === MIDDLEWARE_TARGET_ROUTER && middleware.later) {
        this.router.use(middleware.fn);
        LOG.info(
          'Use Router middleware', _.pick(middleware, 'provider', 'name'),
        );
      }
    }

    for (const middleware of middlewares) {
      if (middleware.target === MIDDLEWARE_TARGET_APP && middleware.later) {
        this.app.use(middleware.fn);
        LOG.info(
          'Use App middleware', _.pick(middleware, 'provider', 'name'),
        );
      }
    }
  }
}
