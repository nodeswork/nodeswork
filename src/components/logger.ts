import * as _ from 'underscore'
import * as Koa from "koa"
import * as logger from '@nodeswork/logger'

import { NodesworkComponent, NodesworkComponentOption } from './component'


let LOG = logger.getLogger('logger');


export interface LoggerKoaContext extends Koa.Context {
  logKey:      string
  requestLog:  any
}


export interface LoggerClass {
  new(ctx: LoggerKoaContext): Logger;
}


export class Logger extends NodesworkComponent<LoggerKoaContext> {

  private getMeta(meta: any): any {
    return _.extend({ key: this.ctx.logKey }, meta);
  }

  request(data: {}): void {
    _.extend(this.ctx.requestLog, data);
  }

  debug(message: string, meta={}): void {
    LOG.debug(message, this.getMeta(meta));
  }

  verbose(message: string, meta={}): void {
    LOG.verbose(message, this.getMeta(meta));
  }

  info(message: string, meta={}): void {
    LOG.info(message, this.getMeta(meta));
  }

  warn(message: string, meta={}): void {
    LOG.warn(message, this.getMeta(meta));
  }

  error(message: string, meta={}): void {
    LOG.error(message, this.getMeta(meta));
  }

  static async initialize(options: NodesworkComponentOption): Promise<void> {
    LOG.info('Component Logger finished first round of initialization.');
    this.prototype.nodeswork.use(setupRequestLog);
  }

  static async initialized(options: NodesworkComponentOption): Promise<void> {
    LOG = logger.getLogger('logger');
    LOG.info('Component Logger is fully initialized.');
  }
}


async function setupRequestLog(ctx: LoggerKoaContext, next: Function): Promise<void> {
  ctx.requestLog = {
    header: {
      path:    ctx.request.path,
      method:  ctx.request.method,
    }
  };

  let responseCode: number;
  try {
    await next();
    responseCode = ctx.response.status;
  } catch (e) {
    responseCode = 500;
    throw e;
  } finally {
    ctx.requestLog.header.responseCode = responseCode;
    (ctx.components.logger as Logger).info('Request', ctx.requestLog);
  }
}
