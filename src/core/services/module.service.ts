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

  public getRegisterdServices(): InjectionMetadata[] {
    return this.getRegisteredBeansWithTag('service');
  }

  public getRegisterdHandlers(): InjectionMetadata[] {
    return this.getRegisteredBeansWithTag('handler');
  }

  public getRegisterdWorkers(): InjectionMetadata[] {
    return this.getRegisteredBeansWithTag('worker');
  }

  private getRegisteredBeansWithTag(tag: string): InjectionMetadata[] {
    const beans = beanProvider.getRegisteredBeans();

    const metadatas = _.map(beans, (bean) => getInjectionMetadata(bean));

    const filteredMetas = _.filter(metadatas, (metadata) => {
      return metadata.tags && metadata.tags.indexOf(tag) >= 0;
    });

    return filteredMetas;
  }
}
