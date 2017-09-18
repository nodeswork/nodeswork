import { Injectable } from './injection';

export interface Worker<T> {
  work(): T;
}

export function Worker() {
  const injectable = Injectable({ inputs: true });
  return injectable;
}
