import * as kiws from '../kiws';

export interface Worker<T> {
  work(): T;
}

export function Worker() {
  const injectable = kiws.Injectable({ inputs: true, tags: ['worker'] });
  return injectable;
}
