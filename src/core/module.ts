import 'reflect-metadata';

import * as _ from 'underscore';

import { Injectable, beanProvider, Constructor } from './injection';
import { Worker } from './worker';

export const moduleMetadataKey = Symbol('nw:module');

export interface NwModuleOptions {
  depends?:  Constructor[];
  workers?:  Constructor[];
  accounts?: Constructor[];
  services?: Constructor[];
}

export interface ModuleMetadata extends NwModuleOptions {
}

export function NwModule(options: NwModuleOptions) {
  const injectable = Injectable();
  return <T extends {new(...args:any[]):{}}>(constructor: T) => {
    injectable(constructor);

    const moduleMetadata: ModuleMetadata = {
      workers: [],
      accounts: [],
      services: [],
    };

    function process(opts: NwModuleOptions) {
      _.each(opts.workers, (worker) => {
        beanProvider.register(worker);
        moduleMetadata.workers.push(worker);
      });
      _.each(opts.accounts, (account) => {
        beanProvider.register(account);
        moduleMetadata.accounts.push(account);
      });
      _.each(opts.services, (service) => {
        beanProvider.register(service);
        moduleMetadata.services.push(service);
      });
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

    constructor.prototype.$getModuleMetadata  = $getModuleMetadata;
    constructor.prototype.$work               = $work;
  };
}

export function getModuleMetadata(nwModule: Constructor): ModuleMetadata {
  return Reflect.getMetadata(moduleMetadataKey, nwModule.prototype);
}

export interface NwModule {
  $getModuleMetadata(): ModuleMetadata;
  $work<T>(workerName: string, inputs: object[]): Promise<T>;
}

function $getModuleMetadata() {
  return getModuleMetadata(this.constructor);
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
