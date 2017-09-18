import 'reflect-metadata';

import * as _ from 'underscore';

export const injectionMetadataKey = Symbol('nw:injection');

export type Beans = {[key: string]: Constructor[]};

export type Constructor = {new(...args:any[]): {}};
export interface ConstructorOverride {
  provide:   string;
  useClass:  Constructor;
  multi?:    boolean;
}

function isConstructor(arg: Constructor | ConstructorOverride): arg is Constructor {
  return typeof arg === 'function';
}

export class BeanProvider {

  private beans: Beans = {};
  private singletons: {[key: string]: any[]} = {};

  register(val: Constructor|ConstructorOverride) {
    let override;
    if (isConstructor(val)) {
      override = {
        provide:   val.name,
        useClass:  val,
        multi:     false,
      };
    } else {
      override = val;
    }

    const key = override.provide;
    const exists = this.beans[key];

    if (!override.multi &&
      exists != null && exists.length && exists[0] !== val
    ) {
      throw new Error(`Bean {${key}} already registered`);
    }
    if (this.beans[key] == null) {
      this.beans[key] = [];
    }
    this.beans[key] = _.union(this.beans[key], [override.useClass]);
  }

  getBean<T>(key: string, inputs: any[] = []): T {
    const instances = this.getBeans<T>(key, inputs, { limit: 1 });
    return instances[0];
  }

  getBeans<T>(
    key: string, inputs: any[] = [], options: {limit?: number} = {},
  ): T[] {
    const constructors = this.beans[key];
    if (constructors == null) {
      throw new Error(`bean {${key}} is not registed`);
    }

    const firstConstructors = _.first(constructors, options.limit || 1);
    const result = _.map(firstConstructors, (constructor) => {
      let injectionMetadata: InjectionMetadata = (
        Reflect.getMetadata(injectionMetadataKey, constructor.prototype) || {}
      );

      const args = _.map(injectionMetadata.injects, (inject) => {
        return this.getSingletonBean(inject.ref);
      });

      const instance = new (constructor.bind.apply(
        constructor, [null].concat(args),
      ));

      _.each(injectionMetadata.inputs, (input) => {
        const candidates = _.filter(
          inputs, (i) => i.constructor.name === input.ref,
        );
        if (input.isArray) {
          instance[input.propertyName] = candidates;
        } else if (candidates.length > 0) {
          instance[input.propertyName] = candidates[0];
        } else {
          instance[input.propertyName] = this.getBean(input.ref, inputs);
        }
      });
      _.each(injectionMetadata.posts, (post) => {
        instance[post]();
      });
      return instance;
    });
    return result;
  }

  getSingletonBean<T>(key: string): T {
    const vals: T[] = this.getSingletonBeans(key);
    return vals[0];
  }

  getSingletonBeans<T>(key: string): T[] {
    if (!(key in this.singletons)) {
      this.singletons[key] = this.getBeans(key);
    }
    return this.singletons[key] as T[];
  }

  getRegisteredBeans(): Constructor[] {
    return _.flatten(Object.values(this.beans));
  }

  clear() {
    this.singletons = {};
    this.beans = {};
  }
}

export const beanProvider = new BeanProvider();

export interface InjectMetadata {
  ref: string;
}

export interface InputMetadata extends InjectMetadata {
  propertyName:  string;
  isArray:       boolean;
}

export interface InjectionMetadata {
  name?:     string;
  tags?:     string[];
  meta?:     object;
  posts?:    string[];
  injects?:  InjectMetadata[];
  inputs?:   InputMetadata[];
}

export function Input(options: { type?: string } = {}) {

  return (target: any, propertyName: string) => {
    const t = Reflect.getMetadata('design:type', target, propertyName);
    const isArray = t.name === 'Array';
    const ref = options.type || t.name;

    let injectionMetadata: InjectionMetadata = (
      Reflect.getMetadata(injectionMetadataKey, target) || {}
    );
    if (injectionMetadata.inputs == null) {
      injectionMetadata.inputs = [];
    }
    if (t.name == null) {
      throw new Error(`missing type of property ${propertyName}`);
    }

    injectionMetadata.inputs.push({
      propertyName,
      ref,
      isArray,
    });
    Reflect.defineMetadata(injectionMetadataKey, injectionMetadata, target);
  };
}

export function PostConstruct() {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    let injectionMetadata: InjectionMetadata = (
      Reflect.getMetadata(injectionMetadataKey, target) || {}
    );
    if (injectionMetadata.posts == null) {
      injectionMetadata.posts = [];
    }
    injectionMetadata.posts.push(propertyName);
    Reflect.defineMetadata(injectionMetadataKey, injectionMetadata, target);
  };
}

export interface InjectableOptions {
  inputs?:  boolean;
  tags?:    string[];
  meta?:    object;
}

export function Injectable(options: InjectableOptions = {}) {
  return <T extends {new(...args:any[]):{}}>(constructor: T) => {

    const injectionMetadata: InjectionMetadata = Reflect.getMetadata(
      injectionMetadataKey, constructor.prototype,
    ) || {};
    const ct = Reflect.getMetadata('design:paramtypes', constructor);

    injectionMetadata.name = constructor.name;

    if (!options.inputs) {
      injectionMetadata.inputs = [];
    }

    injectionMetadata.injects = _.map(ct, (a: any) => {
      return {
        ref:      a.name,
        isArray:  false,
      };
    });

    if (options.tags) {
      injectionMetadata.tags = options.tags;
    }

    if (options.meta) {
      injectionMetadata.meta = options.meta;
    }

    Reflect.defineMetadata(
      injectionMetadataKey, injectionMetadata, constructor.prototype,
    );
  };
}

export function getInjectionMetadata(
  constructor: Constructor
): InjectionMetadata {
  return Reflect.getMetadata(injectionMetadataKey, constructor.prototype);
}
