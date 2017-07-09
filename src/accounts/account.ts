import * as Koa from "koa"

import { validator } from '@nodeswork/utils'

import { NodesworkComponent, Request } from '../components'


export interface AccountActionOption {
  action: string
  params: {}
}


export interface AccountKoaContext extends Koa.Context {
  executionId: string
}


export class NodesworkAccount<AT extends AccountKoaContext> {

  _id: string
  ctx: AT  // Injected from __proto__.

  /**
   * Initialize current account.
   */
  async initialize(): Promise<void> {
  }

  /**
   * Take action on current account.
   */
  async action(options: AccountActionOption): Promise<any> {
    let action: string = options.action;
    let request: Request = this.getComponent('request');

    return await request.post({
      url: `/api/v1/executions/${this.ctx.executionId}/accounts/${this._id}/action`,
      body: options,
    });
  }

  getComponent<T extends NodesworkComponent<Koa.Context>>(name: string): T {
    let ret = this.ctx.components[name];
    validator.isRequired(ret, {
      meta: {
        path: `ctx.components.${name}`,
      },
    });
    return <T>ret;
  }
}
