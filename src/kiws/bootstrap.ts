import * as _                        from 'underscore';
import { Module }                    from './module';
import { beanProvider, Constructor } from './injection';

/**
 * Bootstrap series modules.
 */
export function bootstrap(...modules: any[]) {

  for (const m of modules as Module[]) {
    m.$register();
  }

  for (const m of modules as Module[]) {
    beanProvider.getSingletonBean(m.name);
  }
}
