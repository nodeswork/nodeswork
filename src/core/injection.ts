import 'reflect-metadata';

import * as _ from 'underscore';

export const injectionMetadataKey = Symbol('nw:injection');

export type Beans = {[key: string]: Constructor};

export type Constructor = {new(...args:any[]): {}};

export class BeanProvider {

  private beans: Beans = {};
  private singletons: {[key: string]: any} = {};

  register(val: Constructor) {
    const key = val.name;
    const exists = this.beans[key];
    if (exists != null && exists !== val) {
      throw new Error(`Bean {${key}} already registered`);
    }
    this.beans[key] = val;
  }

  getBean<T>(key: string, inputs: any[] = []): T {
    const constructor = this.beans[key];
    if (constructor == null) {
      throw new Error(`bean {${key}} is not registed`);
    }

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
      } else {
        instance[input.propertyName] = candidates[0];
      }
    });
    return instance;
  }

  getSingletonBean<T>(key: string): T {
    if (!(key in this.singletons)) {
      this.singletons[key] = this.getBean(key);
    }
    return this.singletons[key] as T;
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
  path?:     string;
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

export function Injectable(options?: { inputs: boolean }) {
  return <T extends {new(...args:any[]):{}}>(constructor: T) => {

    const injectionMetadata: InjectionMetadata = Reflect.getMetadata(
      injectionMetadataKey, constructor.prototype,
    ) || {};
    const ct = Reflect.getMetadata('design:paramtypes', constructor);

    if (!(options && options.inputs)) {
      injectionMetadata.inputs = [];
    }

    injectionMetadata.injects = _.map(ct, (a: any) => {
      return {
        ref:      a.name,
        isArray:  false,
      };
    });

    Reflect.defineMetadata(
      injectionMetadataKey, injectionMetadata, constructor.prototype,
    );
  };
}
