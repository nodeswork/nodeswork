import * as Koa     from 'koa'

import { Service }  from '../service';

@Service()
export class KoaService {

  public app: Koa = new Koa();

  constructor() { }
}
