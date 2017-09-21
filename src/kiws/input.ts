import 'reflect-metadata';

import * as _                      from 'underscore';
import * as Koa                    from 'koa';
import * as Router                 from 'koa-router';

import { Constructor, Injectable } from './injection';

export const INPUT                = 'INPUT';

const INPUT_TAGS                  = [ 'input', 'provider' ];
export const INPUT_METADATA_KEY   = Symbol('kiws:input');

/**
 * InputProvider class decorator will register the middlewares declared in
 * the provider to provide inputs when serving traffic.
 */
export function InputProvider(
  options: { tags?: string[], meta?: object } = {},
) {
  const injectable = Injectable({
    inputs:  true,
    tags:    _.union(INPUT_TAGS, options.tags || []),
    meta:    options.meta,
  });
  return (constructor: Constructor) => {
    injectable(constructor);
    (constructor as any).prototype.$generateInputs = $generateInputs;
  };
}

export function InputGenerator(options: {} = {}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const generators: InputGeneratorMetadata[] =
      Reflect.getOwnMetadata(INPUT_METADATA_KEY, target) || [];
    generators.push(_.extend({}, options, {
      provider: target.constructor.name,
      name:     propertyKey,
    }));
    Reflect.defineMetadata(INPUT_METADATA_KEY, generators, target);
  }
}

export interface InputGeneratorMetadata {
  provider:  string;
  name:      string;
}

export interface RawInput {
  type:      string;
  data:      any;
}

export interface InputProvider {
  $generateInputs(ctx: Router.IRouterContext): RawInput[];
}

function $generateInputs(ctx: Router.IRouterContext): RawInput[] {
  const metadatas: InputGeneratorMetadata[] = Reflect.getOwnMetadata(
    INPUT_METADATA_KEY, this.constructor.prototype
  ) || [];
  const inputs: RawInput[][] = _.map(metadatas, (metadata) => {
    return this[metadata.name](ctx);
  });
  return _.flatten(inputs);
}
