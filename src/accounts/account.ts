import * as Koa from "koa"

import { validator, NodesworkError } from "@nodeswork/utils"

import { Nodeswork } from '../nw'
import {
  NodesworkComponent,
  NodesworkComponentOption,
  Request } from '../components'


export interface AccountActionOption {
  action: string
  params: {}
}


export interface AccountKoaContext extends Koa.Context {
  executionId: string
}


export interface NodesworkAccountClass {
  new(): NodesworkAccount<AccountKoaContext>;

  initialize(options: NodesworkAccountOption): Promise<void>;
  initialized(options: NodesworkAccountOption): Promise<void>;
}


export interface NodesworkAccountOption extends NodesworkComponentOption {
}


export class NodesworkAccount<AT extends AccountKoaContext>
  extends NodesworkComponent<AT> {

  _id: string
  ctx: AT  // Injected from __proto__.
  nodeswork:  Nodeswork

  /**
   * Initialize current account.
   */
  async init(): Promise<void> {
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

  /**
   * Intialize current account when nodeswork starts.
   */
  static async initialize(options: NodesworkAccountOption): Promise<void> {
  }

  /**
   * A second round of intialization for dealing with account dependencies.
   */
  static async initialized(options: NodesworkAccountOption): Promise<void> {
  }
}
