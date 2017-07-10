import * as _ from 'underscore'
import * as Koa from "koa"

import { NodesworkComponent, NodesworkComponentOption } from './component'
import { Logger } from './logger'
import { Nodeswork } from '../nodeswork'


export interface RequestKoaContext extends Koa.Context {
}


export interface RequestClass {
  new(ctx: RequestKoaContext): Request;
}


export class Request extends NodesworkComponent<RequestKoaContext> {

  logger: Logger

  constructor(ctx: Koa.Context) {
    super(ctx);
    this.logger = <Logger>this.depends('logger');
  }

  async get(options: any): Promise<any> {
    return this.request(_.extend({}, options, {
      method: 'GET',
    }));
  }

  async post(options: any): Promise<any> {
    return this.request(_.extend({}, options, {
      method: 'POST',
    }));
  }

  async request(options: any): Promise<any> {
    let startTime = Date.now();
    try {
      let res = await this.nodeswork.request(options);
      this.logger.debug('Send request success', {
        options,
        duration: Date.now() - startTime,
      });
      return res;
    } catch (e) {
      this.logger.error('Send request failed', {
        options,
        duration: Date.now() - startTime,
      });
    }
  }
}
