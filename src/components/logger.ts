import * as _ from 'underscore'
import * as Koa from "koa"
import * as logger from '@nodeswork/logger'

import { NodesworkComponent, NodesworkComponentOption } from './component'


let LOG = logger.getLogger('logger');


export interface LoggerKoaContext extends Koa.Context {
  logKey: string
}


export class Logger extends NodesworkComponent<LoggerKoaContext> {

  private getMeta(meta: any): any {
    return _.extend({ key: this.ctx.logKey }, meta);
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
  }

  static async initialized(options: NodesworkComponentOption): Promise<void> {
    LOG = logger.getLogger('logger');
    LOG.info('Component Logger is fully initialized.');
  }
}
