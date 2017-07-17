import * as _ from 'underscore'
import * as http from 'http'
import * as path from 'path'
import * as request from 'request-promise'
import * as url from 'url'
import * as Koa from 'koa'
import * as KoaRouter from 'koa-router'
import * as KoaBodyParser from 'koa-bodyparser'

import * as logger from '@nodeswork/logger'
import {
  validator,
  handler,
  NodesworkError } from '@nodeswork/utils'

import {
  RequestAPI,
  RequestOption } from './globals'
import {
  NodesworkAccount,
  AccountKoaContext,
  NodesworkAccountClass,
  NodesworkAccountOption,
  NodesworkAccountManager } from './accounts'
import {
  Logger,
  LoggerClass,
  Request,
  RequestClass,
  NodesworkComponent,
  NodesworkComponentClass,
  NodesworkComponentManager,
  NodesworkComponentOption } from './components'

import * as constants from './constants'


const LOG = logger.getLogger('logger');
const REQUEST_LOG = LOG;


export interface NodesworkOption {
  env?:           string
  name?:          string
  server?:        string
  host?:          string
  port?:          number
  appletId?:      string
  appletToken?:   string
  [name: string]: any
}


let DEFAULT_CONFIG: NodesworkOption = {
  env:          'development',
  name:         null,
  server:       null,
  host:         'localhost',
  port:         28888,
  appletId:     null,
  appletToken:  null,
};


export type MethodMiddlewaresMap = {
  [path: string]:    KoaRouter.IMiddleware[]
}


export type NodesworkMiddlewares = {
  [method: string]:  MethodMiddlewaresMap
}


export interface NodesworkContext extends KoaRouter.IRouterContext {
  nodeswork:     Nodeswork
  userApplet:    { _id: string, accounts: {}[] }
  execution:     any
  executionId:   string
  logKey:        string
  accounts:      NodesworkAccount<AccountKoaContext>[]
}


export interface NodesworkClass {
  new(): Nodeswork;
}


export class Nodeswork {

  Nodeswork           = Nodeswork;
  Logger              = Logger;
  Request             = Request;
  NodesworkAccount    = NodesworkAccount;
  NodesworkComponent  = NodesworkComponent;

  accountManager:    NodesworkAccountManager
  componentManager:  NodesworkComponentManager
  _options:          any = {}
  requestClient:     RequestAPI
  initialized:       boolean = false
  app:               Koa = new Koa()
  router:            KoaRouter
  server:            http.Server
  middlewares:       NodesworkMiddlewares = newMiddlwares()
  commonMiddlewares: KoaRouter.IMiddleware[] = []

  constructor(options: NodesworkOption = null) {
    this.accountManager   = new NodesworkAccountManager(this);
    this.componentManager = new NodesworkComponentManager(this);
    this.router           = new KoaRouter();

    this.router
      .use(handler.logRequestHandler(REQUEST_LOG))
      .use(handler.internalErrorHandler(REQUEST_LOG, {
        debug: process.env.NODE_ENV != 'production'
      }))
      .use(rootHandler(this));

    if (options != null) {
      this.config(options);
    }

    this.withComponent(Logger, undefined);
  }

  /**
   * Either to config current nodeswork instance, or retrieve a config value.
   *
   * @param {NodesworkOption} options - config current nodeswork instance.
   * @param {string} options - retrieve the config value for this key.
   */
  config(options: NodesworkOption | string = DEFAULT_CONFIG): Nodeswork | any {
    if (_.isString(options)) {
      return this._options[options];
    }

    let env: string = process.env.NODE_ENV || options.env || 'development';

    let envOptions = _.chain(process.env)
      .keys()
      .filter((x) => x.startsWith('NW_'))
      .map((x) => [x.substring(3), process.env[x]]) // len('NW_') == 3
      .object()
      .value();
    let localOptions = _.omit(options, 'env');

    switch (env) {
      case 'production':
        _.extend(this._options, localOptions, envOptions, {
          env: env,
        });
        break;
      case 'development':
      case 'test':
        _.extend(this._options, envOptions, localOptions, {
          env: env,
        });
        break;
      default:
        throw new NodesworkError('Unkown env when initializing nodeswork', {
          env:  env,
          path: 'nodeswork.options.env',
        });
    }

    if (!this._options.jar) {
      this._options.jar = request.jar();

      this.requestClient = request.defaults({
        jar:                 this._options.jar,
        followAllRedirects:  true,
        json:                true
      });
    }

    return this;
  }

  /**
   * Register a new account.
   */
  withAccount(
    clazz: NodesworkAccountClass, options: NodesworkAccountOption,
    overwrite = false
  ): Nodeswork {
    this.accountManager.register(clazz, options, overwrite);
    return this;
  }

  /**
   * Register a new component.
   */
  withComponent(
    clazz: NodesworkComponentClass, options: NodesworkComponentOption = {},
    overwrite = false
  ): Nodeswork {
    this.componentManager.register(clazz, options, overwrite);
    return this;
  }

  use(...middlewares: KoaRouter.IMiddleware[]): Nodeswork {
    Array.prototype.push.apply(this.commonMiddlewares, middlewares);
    return this;
  }

  process(...middlewares: KoaRouter.IMiddleware[]): Nodeswork {
    if (!this.middlewares.POST[constants.PROCESSING_URL_PATH]) {
      this.middlewares.POST[constants.PROCESSING_URL_PATH] = [];
    }
    Array.prototype.push.apply(
      this.middlewares.POST[constants.PROCESSING_URL_PATH],
      middlewares,
    )
    return this;
  }

  view(viewPath: string, ...middlewares: KoaRouter.IMiddleware[]): Nodeswork {
    let fullPath = path.join(constants.VIEW_URL_PATH, viewPath);
    if (!this.middlewares.GET[fullPath]) {
      this.middlewares.GET[fullPath] = [];
    }
    Array.prototype.push.apply(
      this.middlewares.GET[fullPath],
      middlewares,
    )
    return this;
  }

  action(
    actionPath: string, ...middlewares: KoaRouter.IMiddleware[]
  ): Nodeswork {
    let fullPath = path.join(constants.ACTION_URL_PATH, actionPath);
    if (!this.middlewares.POST[fullPath]) {
      this.middlewares.POST[fullPath] = [];
    }
    Array.prototype.push.apply(
      this.middlewares.POST[fullPath],
      middlewares,
    )
    return this;
  }

  /**
   * Send request using the client.
   */
  async request(options: RequestOption): Promise<any> {
    let uri: string;

    if (options.uri != null) {
      uri = options.uri.toString();
    } else {
      let aOptions = options as any;
      uri = aOptions.url;
      delete aOptions.url;
    }

    options.uri = url.resolve(this.config('server') as string, uri);
    return await this.requestClient(options);
  }

  /**
   * Set the default options for the request client.
   */
  requestDefaults(options: RequestOption): Nodeswork {
    this.requestClient = this.requestClient.defaults(options);
    return this;
  }

  async init(): Promise<void> {
    let self = this;

    if (this.initialized) {
      return;
    }

    if (!this._options) {
      this.config();
    }

    // Check required configurations.
    for (let field of ['server', 'appletId', 'appletToken']) {
      validator.isRequired(this._options[field], {
        message: 'Missing configurations',
        meta: {
          path: `nodeswork.config.${field}`,
        },
      });
    }

    // Initialize Koa routes.
    let savedMiddlewares = this.middlewares;
    this.middlewares     = newMiddlwares();

    await this.componentManager.initialize();
    await this.accountManager.initialize();

    await this.componentManager.initialized();
    await this.accountManager.initialized();

    _.each(savedMiddlewares, (targets, method) => {
      _.each(targets, (middlewares, path) => {
        if (self.middlewares[method][path] == null) {
          self.middlewares[method][path] = [];
        }
        Array.prototype.push.apply(
          self.middlewares[method][path],
          middlewares,
        );
      });
    });

    _.each(this.middlewares, (targets, method) => {
      _.each(targets, (middlewares, path) => {
        if (path.startsWith(constants.PROCESSING_URL_PATH)) {
          self.bind.apply(
            self,
            _.flatten([
              path, method, processHandler(self), this.commonMiddlewares,
              middlewares
            ]),
          );
        } else if (path.startsWith(constants.VIEW_URL_PATH)) {
          self.bind.apply(
            self,
            _.flatten([path, method, this.commonMiddlewares, middlewares]),
          );
        } else if (path.startsWith(constants.ACTION_URL_PATH)) {
          self.bind.apply(
            self,
            _.flatten([path, method, this.commonMiddlewares, middlewares]),
          );
        } else {
          self.bind.apply(
            self,
            _.flatten([path, method, this.commonMiddlewares, middlewares]),
          );
        }
      });
    });

    // Setup app and server.
    this.app
      .use(KoaBodyParser())
      .use(this.router.routes())
      .use(this.router.allowedMethods())
      .use(handler.uncaughtRequestHandler(REQUEST_LOG));

    this.server       = http.createServer(this.app.callback());

    this.initialized  = true;
  }

  async start(): Promise<void> {
    await this.init();
    let self = this;
    await new Promise<void>((resolve, reject) => {
      self.server.listen(
        self.config('port'),
        self.config('host') || 'localhost',
        (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  bind(path: string, method: string, ...middlewares: KoaRouter.IMiddleware[]) {
    let names = _.map(middlewares, (m) => m.name || 'unknown');
    LOG.info('Bind router', {
      path:         path,
      method:       method,
      middlewares:  names,
    });

    let params: any[] = [path];
    Array.prototype.push.apply(params, middlewares);
    (this.router as any)[method.toLowerCase()].apply(this.router, params);
  }
}


function logUncaughtRequests(ctx: Koa.Context) {
  LOG.warn('Uncaught request', {
    url:      ctx.request.url,
    method:   ctx.request.method,
    headers:  ctx.request.headers,
  });
}


function newMiddlwares(): NodesworkMiddlewares {
  return {
    GET:   {},
    POST:  {},
  }
}


function processHandler(nodeswork: Nodeswork): KoaRouter.IMiddleware {
  return async function processHandler(iCtx, next) {
    let ctx         = iCtx as NodesworkContext;
    ctx.userApplet  = ctx.request.body.userApplet;
    ctx.execution   = ctx.request.body.execution;
    ctx.executionId = ctx.execution ? ctx.execution._id : null;

    validator.isRequired(ctx.userApplet && ctx.userApplet._id, {
      message:         'userApplet is required.',
      meta:            {
        responseCode:  400,
      },
    });

    ctx.accounts = await nodeswork.accountManager.parseAccounts(
      ctx, ctx.userApplet.accounts
    );

    await next();
  };
}


function rootHandler(nodeswork: Nodeswork): KoaRouter.IMiddleware {
  return async function rootHandler(ctx, next) {
    let nCtx = ctx as any as NodesworkContext;
    let startTime = Date.now();

    nCtx.nodeswork = nodeswork;
    nCtx.response.headers['nodeswork-processor'] = nodeswork.config('name');
    try {
      nCtx.components = nodeswork.componentManager.getComponentMap(nCtx);
      await next();
    } finally {
      nCtx.response.headers['nodeswork-processing-duration'] = (
        Date.now() - startTime
      );
    }
  };
}
