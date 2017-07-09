import * as Koa from "koa"

import { validator, NodesworkError } from "@nodeswork/utils"

const Case: any = require('case');


export type NodesworkComponentMap = {
  [name: string]: NodesworkComponent
};


declare module "koa" {

  export interface Context {
    components: NodesworkComponentMap
  }
}


export interface NodesworkComponentOption {
}


export interface NodesworkComponentClass {
  new(ctx: Koa.Context): NodesworkComponent;

  initialize(options: NodesworkComponentOption): Promise<void>;
  initialized(options: NodesworkComponentOption): Promise<void>;
}


export abstract class NodesworkComponent {

  protected ctx: Koa.Context

  constructor(ctx: Koa.Context) {
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
  depends(name: string): NodesworkComponent {
    let res: NodesworkComponent = this.ctx.components[name];
    validator.isRequired(res, {meta: {
      path: `ctx.components.${name}`,
      hints: `Ensure component ${name} is imported`,
    }});
    return res;
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


// TODO: Move outside.
export interface Nodeswork {
}


export class NodesworkComponentManager {

  nodeswork:  Nodeswork
  classes:    Array<[NodesworkComponentClass, NodesworkComponentOption]> = [];

  constructor(nodeswork: Nodeswork) {
    this.nodeswork = nodeswork;
  }

  /**
   * Register a new component class.
   */
  register(
    cls: NodesworkComponentClass,
    options: NodesworkComponentOption,
    overwrite: boolean = false,
  ) {
    let self    = this;
    let exists  = false;
    cls.prototype.nodeswork = this.nodeswork;

    this.classes.forEach(([clazz, options], index) => {
      if (cls.name == clazz.name) {
        if (overwrite) {
          self.classes[index] = [clazz, options];
        } else {
          throw new NodesworkError(
            `Component has been registered before,
              set overwrite=true to overwrite it`,
            { name: cls.name },
          )
        }
        exists = true;
      }
    });

    if (!exists) {
      this.classes.push([cls, options]);
    }
  }

  /**
   * Intialize registered components.
   */
  async intialize(): Promise<void> {
    for (let [clazz, options] of this.classes) {
      await clazz.initialize(options);
    }
  }

  /**
   * Call second round of initialized for registered components.
   */
  async intialized(): Promise<void> {
    for (let [clazz, options] of this.classes) {
      await clazz.initialized(options);
    }
  }

  getComponentMap(ctx: Koa.Context): NodesworkComponentMap {
    let ret = Object.create(Object.prototype);
    let cache: NodesworkComponentMap = {};
    let properties: {[name: string]: object} = {};

    this.classes.forEach(([clazz, options]) => {
      let name: string = Case.camel(clazz.name);
      properties[name] = {
        get: () => {
          if (cache[name] == null) {
            cache[name] = new clazz(ctx);
          }
          return cache[name];;
        },
        writable: false
      };
    });

    Object.defineProperties(ret, properties);
    return ret;
  }
}
