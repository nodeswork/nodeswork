import 'reflect-metadata';

import * as _ from 'underscore';

import { Injectable, beanProvider, Constructor } from './injection';

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
  };
}

export function getModuleMetadata(nwModule: Constructor): ModuleMetadata {
  return Reflect.getMetadata(moduleMetadataKey, nwModule.prototype);
}
