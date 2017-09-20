import { Module }       from './module';
import { beanProvider } from './injection';
import { CoreModule }   from './modules';

/**
 * Bootstrap series modules.
 */
export function bootstrap(...modules: any[]) {

  modules.push(CoreModule);

  for (const m of modules as Module[]) {
    m.$register();
  }

  for (const m of modules as Module[]) {
    beanProvider.getSingletonBean(m.name);
  }
}
