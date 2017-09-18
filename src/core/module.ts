import 'reflect-metadata';

import * as _ from 'underscore';

import { Injectable, beanProvider, Constructor } from './injection';
import { Worker } from './worker';

export const moduleMetadataKey = Symbol('nw:module');

export interface NwModuleOptions {
  depends?:    Constructor[];
  workers?:    Constructor[];
  accounts?:   Constructor[];
  services?:   Constructor[];
  bootstrap?:  Constructor[];
}

export interface ModuleMetadata extends NwModuleOptions {
}

export function NwModule(options: NwModuleOptions) {
  const injectable = Injectable();
  return <T extends {new(...args:any[]):{}}>(constructor: T) => {
    injectable(constructor);

    const moduleMetadata: ModuleMetadata = {
      workers:    [],
      accounts:   [],
      services:   [],
      bootstrap:  [],
    };

    function process(opts: NwModuleOptions) {
      _.each(opts.workers, (worker) => {
        moduleMetadata.workers.push(worker);
      });
      _.each(opts.accounts, (account) => {
        moduleMetadata.accounts.push(account);
      });
      _.each(opts.services, (service) => {
        moduleMetadata.services.push(service);
      });
      _.each(opts.bootstrap, (component) => {
        moduleMetadata.bootstrap.push(component);
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
