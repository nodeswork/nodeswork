import 'reflect-metadata';

import * as _          from 'underscore';

import {
  beanProvider,
  Injectable,
  Constructor,
  ConstructorOverride,
}                      from './injection';
import { MIDDLEWARE }  from './middleware';
import { HANDLER }     from './handler';
import { INPUT }       from './input';

const MODULE_METADATA_KEY  = Symbol('kiws:module');
const MODULE_TAGS          = [ 'module' ];

export interface ModuleMetadata {
  depends?:      Module[];
  middlewares?:  Constructor[];
  handlers?:     Constructor[];
  inputs?:       Constructor[];
  providers?:    (Constructor|ConstructorOverride)[];
}

export function Module(moduleMetadata: ModuleMetadata) {
  const injectable = Injectable({ tags: MODULE_TAGS });

  return (constructor: Constructor) => {
    injectable(constructor);

    Reflect.defineMetadata(
      MODULE_METADATA_KEY, moduleMetadata, constructor.prototype,
    );

    (constructor as any).$getModuleMetadata  = $getModuleMetadata;
    (constructor as any).$constructors       = $constructors;
    (constructor as any).$register           = $register;
  };
}

export interface Module extends Constructor {
  $getModuleMetadata(): ModuleMetadata;
  $constructors(): (Constructor|ConstructorOverride)[];
  $register(): void;
}

function $getModuleMetadata(): ModuleMetadata {
  return Reflect.getMetadata(MODULE_METADATA_KEY, this.prototype);
}

function $constructors(): (Constructor|ConstructorOverride)[] {
  const moduleMetadata: ModuleMetadata = this.$getModuleMetadata();
  const results = [
    moduleMetadata.providers || [],
  ];
  if (moduleMetadata.middlewares != null) {
    results.push([{
      provide:   MIDDLEWARE,
      useClass:  moduleMetadata.middlewares,
      multi:     true,
    }]);
  }
  if (moduleMetadata.handlers != null) {
    results.push([{
      provide:   HANDLER,
      useClass:  moduleMetadata.handlers,
      multi:     true,
    }]);
    results.push(moduleMetadata.handlers);
  }
  if (moduleMetadata.inputs != null) {
    results.push([{
      provide:   INPUT,
      useClass:  moduleMetadata.inputs,
      multi:     true,
    }]);
  }
  return _.flatten(results);
}

function $register() {
  const moduleMetadata: ModuleMetadata = this.$getModuleMetadata();
  if (moduleMetadata.depends != null) {
    for (let m of moduleMetadata.depends) {
      m.$register();
    }
  }

  const constructors: (Constructor|ConstructorOverride)[] =
    this.$constructors();
  for (const constructor of constructors) {
    beanProvider.register(constructor);
  }
  beanProvider.register(this);
}
