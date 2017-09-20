import { bootstrap as kiwsBootstrap } from '../kiws';
import { AppletModule }               from './modules';

export function bootstrap(...modules: any[]) {
  modules.push(AppletModule);
  kiwsBootstrap.apply(null, modules);
}
