import { Injectable } from './injection';

export function Service() {
  const injectable = Injectable({ tags: ['service'] });
  return injectable;
}
