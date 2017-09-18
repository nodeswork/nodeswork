import { Service }       from '../service';
import { KoaService }    from './koa.service';
import { ModuleService } from './module.service';

@Service()
export class CoreService {

  constructor(
    private koa: KoaService,
    private modules: ModuleService,
  ) {
    console.log(this.modules.getRegisterdServices());
    console.log(this.modules.getRegisterdWorkers());
    this.koa.app.listen(28900);
    console.log('server is start at http://localhost:28900');
  }
}
