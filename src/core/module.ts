import 'reflect-metadata';

import * as _ from 'underscore';

import { Injectable, beanProvider, Constructor } from './injection';
import { Worker } from './worker';

export const moduleMetadataKey = Symbol('nw:module');

export interface NwModuleOptions {
  depends?:    Constructor[];
  workers?:    Constructor[];
  accounts?:   Constructor[];
  handlers?:   Constructor[];
  services?:   Constructor[];
  bootstrap?:  Constructor[];
}

export interface ModuleMetadata extends NwModuleOptions {
}

export function NwModule(options: NwModuleOptions) {
  const injectable = Injectable({ tags: ['module'] });
  return <T extends {new(...args:any[]):{}}>(constructor: T) => {
    injectable(constructor);

    const moduleMetadata: ModuleMetadata = {
      workers:    [],
      accounts:   [],
      handlers:   [],
      services:   [],
      bootstrap:  [],
    };

    function process(opts: NwModuleOptions) {
      Array.prototype.push.apply(moduleMetadata.workers, opts.workers);
      Array.prototype.push.apply(moduleMetadata.accounts, opts.accounts);
      Array.prototype.push.apply(moduleMetadata.handlers, opts.handlers);
      Array.prototype.push.apply(moduleMetadata.services, opts.services);
      Array.prototype.push.apply(moduleMetadata.bootstrap, opts.bootstrap);
    }

    _.each(options.depends, (dep) => {
      const meta: ModuleMetadata = Reflect.getMetadata(
        moduleMetadataKey, dep.prototype,
      );
      process(meta);
    });
    process(options);

    Reflect.defineMetadata(
      moduleMetadataKey, moduleMetadata, constructor.prototype,
    );

    beanProvider.register(constructor);

    (constructor as any).$getModuleMetadata  = $getModuleMetadata;
    (constructor as any).$work               = $work;
  };
}

export function getModuleMetadata(nwModule: Constructor): ModuleMetadata {
  return Reflect.getMetadata(moduleMetadataKey, nwModule.prototype);
}

export interface NwModule {
  new(...args:any[]): {}
  $getModuleMetadata(): ModuleMetadata;
  $work<T>(workerName: string, inputs: object[]): Promise<T>;
}

function $getModuleMetadata() {
  return getModuleMetadata(this);
}

async function $work<T>(workerName: string, inputs: object[]): Promise<T> {
  const injectedInputs = _.map(inputs, (input: any) => {
    const { type, data } = input;
    if (type == null) {
      throw new Error('type is missing in input');
    }
    const instance = beanProvider.getBean(type);
    _.extend(instance, data);
    return instance;
  });
  const worker = beanProvider.getBean(workerName, injectedInputs) as Worker<T>;
  const result = await worker.work();
  return result;
}
