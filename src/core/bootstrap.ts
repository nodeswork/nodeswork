import * as _                        from 'underscore';
import { NwModule }                  from './module';
import { beanProvider, Constructor } from './injection';
import { KoaService }                from './services';

@NwModule({
  services: [
    KoaService,
  ],
  bootstrap: [
    KoaService,
  ],
})
export class CoreModule {
}

export interface BootstrapOptions {
  noCore?: boolean;
}

export function bootstrap(nwModule: any, options: BootstrapOptions = {}) {
  let bootstraps: Constructor[] = [];

  if (!options.noCore) {
    const coreBootstrap = registerModule(CoreModule as NwModule);
    bootstraps = _.union(bootstraps, coreBootstrap);
  }
  const moduleBootstrap = registerModule(nwModule);
  bootstraps = _.union(bootstraps, moduleBootstrap);

  beanProvider.getSingletonBean(nwModule.name);

  _.each(bootstraps, (c) => {
    beanProvider.getSingletonBean(c.name);
  });
}

function registerModule(nwModule: NwModule): Constructor[] {
  const moduleMetadata = nwModule.$getModuleMetadata();

  for (let worker of moduleMetadata.workers) {
    beanProvider.register(worker);
  }

  for (let account of moduleMetadata.accounts) {
    beanProvider.register(account);
  }

  for (let service of moduleMetadata.services) {
    beanProvider.register(service);
  }

  beanProvider.register(nwModule);

  return moduleMetadata.bootstrap;
}
