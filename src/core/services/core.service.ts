import { Service }       from '../service';
import { KoaService }    from './koa.service';

@Service()
export class CoreService {

  constructor(
    private koa: KoaService,
  ) {
    this.koa.app.listen(28900);
    console.log('server is start at http://localhost:28900');
  }
}
