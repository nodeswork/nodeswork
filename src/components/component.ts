import * as Koa from "koa"

import { validator, NodesworkError } from "@nodeswork/utils"

import { Nodeswork } from '../nw'


export type NodesworkComponentMap = {
  [name: string]: NodesworkComponent<Koa.Context>
};


declare module "koa" {

  export interface Context {
    components: NodesworkComponentMap
  }
}


export interface NodesworkComponentOption {
}


export interface NodesworkComponentClass {
  new(ctx: Koa.Context): NodesworkComponent<Koa.Context>;

  initialize(options: NodesworkComponentOption): Promise<void>;
  initialized(options: NodesworkComponentOption): Promise<void>;
}


export abstract class NodesworkComponent<CT extends Koa.Context> {

  protected ctx: CT
  protected nodeswork: Nodeswork

  constructor(ctx: CT) {
    this.ctx = ctx;
  }

  /**
   * Depends on another component.
   *
   * @param {string} name - name of the component which current component
   * depends on.
   * @throws {NodesworkError} when the dependency is missing.
   * @return {NodesworkComponent}
   */
  depends<T extends Koa.Context>(name: string): NodesworkComponent<T> {
    let res: NodesworkComponent<Koa.Context> = this.ctx.components[name];
    validator.isRequired(res, {meta: {
      path: `ctx.components.${name}`,
      hints: `Ensure component ${name} is imported`,
    }});
    return <NodesworkComponent<T>>res;
  }

  /**
   * Intialize current component when nodeswork starts.
   */
  static async initialize(options: NodesworkComponentOption): Promise<void> {
  }

  /**
   * A second round of intialization for dealing with component dependencies.
   */
  static async initialized(options: NodesworkComponentOption): Promise<void> {
  }
}
