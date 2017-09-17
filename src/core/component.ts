export interface ComponentInject {
  ref: string;
}

export interface ComponentInput extends ComponentInject {
  propertyName:  string;
  isArray:       boolean;
}

export interface ComponentMetadata {
  name?:     string;
  path?:     string;
  injects?:  ComponentInject[];
  inputs?:   ComponentInput[];
}

export const componentMetadataKey = Symbol('nw:component');

export function Input(options: { type?: string } = {}) {

  return (target: any, propertyName: string) => {
    const t = Reflect.getMetadata('design:type', target, propertyName);
    const isArray = t.name === 'Array';
    const ref = options.type || t.name;

    let componentMetadata: ComponentMetadata = (
      Reflect.getMetadata(componentMetadataKey, target) || {}
    );
    if (componentMetadata.inputs == null) {
      componentMetadata.inputs = [];
    }
    if (t.name == null) {
      throw new Error(`missing type of property ${propertyName}`);
    }

    componentMetadata.inputs.push({
      propertyName,
      ref,
      isArray,
    });
    Reflect.defineMetadata(componentMetadataKey, componentMetadata, target);
  };
}

export function injectConstructor<T extends {new(...args:any[]):{}}>(
  constructor: T,
) {

  const componentMetadata: ComponentMetadata = Reflect.getMetadata(
    componentMetadataKey, constructor.prototype,
  );
  const ct = Reflect.getMetadata('design:paramtypes', constructor);

  componentMetadata.injects = ct.map((a: any) => {
    return {
      ref:      a.name,
      isArray:  false,
    };
  });

  Reflect.defineMetadata(
    componentMetadataKey, componentMetadata, constructor.prototype,
  );
}

export function Component () {
  return injectConstructor;
}
