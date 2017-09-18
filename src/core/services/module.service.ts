import * as _                                 from 'underscore';
import { beanProvider, getInjectionMetadata } from '../injection';
import { Service }                            from '../service';

@Service()
export class ModuleService {

  constructor() { }

  public getRegisterdServices(): string[] {
    return this.getRegisteredBeansWithTag('service');
  }

  public getRegisterdWorkers(): string[] {
    return this.getRegisteredBeansWithTag('worker');
  }

  private getRegisteredBeansWithTag(tag: string): string[] {
    const beans = beanProvider.getRegisteredBeans();

    const filteredBeans = _.filter(beans, (bean) => {
      const injectionMetadata = getInjectionMetadata(bean);
      return (
        injectionMetadata.tags && injectionMetadata.tags.indexOf(tag) >= 0
      );
    });

    return _.map(filteredBeans, _.property('name'));
  }
}
