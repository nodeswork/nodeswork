import * as _ from 'underscore'
import { NodesworkComponent, NodesworkComponentOption } from './component'


let logger: any = require('nodeswork-logger').logger;


declare module "koa" {

  export interface Context {
    logKey: string
  }
}


export class Logger extends NodesworkComponent {

  private getMeta(meta: any): any {
    return _.extend({ key: this.ctx.logKey }, meta);
  }

  debug(message: string, meta={}): void {
    logger.debug(message, this.getMeta(meta));
  }

  verbose(message: string, meta={}): void {
    logger.verbose(message, this.getMeta(meta));
  }

  info(message: string, meta={}): void {
    logger.info(message, this.getMeta(meta));
  }

  warn(message: string, meta={}): void {
    logger.warn(message, this.getMeta(meta));
  }

  error(message: string, meta={}): void {
    logger.error(message, this.getMeta(meta));
  }

  static async initialize(options: NodesworkComponentOption): Promise<void> {
    logger.info('Component Logger finished first round of initialization.');
  }

  static async initialized(options: NodesworkComponentOption): Promise<void> {
    logger = require('nodeswork-logger').logger;
    logger.info('Component Logger is fully initialized.');
  }
}
