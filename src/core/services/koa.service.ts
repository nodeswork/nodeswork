import { NwModule } from '../module';
import { Service }  from '../service';

@Service()
export class KoaService {
  constructor() {
    console.log('start from here');
  }
}
