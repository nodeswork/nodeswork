import * as _           from 'underscore';

import {
  beanProvider,
  getInjectionMetadata,
  InjectionMetadata,
}                       from '../injection';
import { Service }      from '../service';

@Service()
export class ModuleService {

  constructor() { }

  public getRegisteredProviders(): InjectionMetadata[] {
    return this.getRegisteredBeansWithTag('provider');
  }

  public getRegisteredHandlers(): InjectionMetadata[] {
    return this.getRegisteredBeansWithTag('handler');
  }

  public getRegisteredBeansWithTag(tag: string): InjectionMetadata[] {
    const beans = beanProvider.getRegisteredBeans();

    const metadatas = _.map(beans, (bean) => getInjectionMetadata(bean));

    const filteredMetas = _.filter(metadatas, (metadata) => {
      return metadata && metadata.tags && metadata.tags.indexOf(tag) >= 0;
    });

    return filteredMetas;
  }
}
