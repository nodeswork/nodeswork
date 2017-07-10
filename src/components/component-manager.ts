import * as Koa from "koa"

import { NodesworkError } from "@nodeswork/utils"

import { Nodeswork } from '../nodeswork'
import {
  NodesworkComponentClass,
  NodesworkComponentOption,
  NodesworkComponentMap } from './component'

const Case: any = require('case');


export abstract class BaseComponentManager<
  CC extends NodesworkComponentClass,
  CO extends NodesworkComponentOption
> {

  nodeswork:  Nodeswork
  classes:    Array<[CC, CO]> = []

  constructor(nodeswork: Nodeswork) {
    this.nodeswork = nodeswork;
  }

  /**
   * Register a new component class.
   */
  register(cls: CC, options: CO, overwrite: boolean = false): void {
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
   * Initialize registered components.
   */
  async initialize(): Promise<void> {
    for (let [clazz, options] of this.classes) {
      await clazz.initialize(options);
    }
  }

  /**
   * Call second round of initialized for registered components.
   */
  async initialized(): Promise<void> {
    for (let [clazz, options] of this.classes) {
      await clazz.initialized(options);
    }
  }
}


export class NodesworkComponentManager extends BaseComponentManager<
  NodesworkComponentClass, NodesworkComponentOption
> {

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
          return cache[name];
        },
      };
    });

    Object.defineProperties(ret, properties);
    return ret;
  }
}
