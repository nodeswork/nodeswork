import { Injectable } from './injection';

export function Service() {
  const injectable = Injectable({ tags: ['service', 'provider'] });
  return injectable;
}
