import { Injectable } from './injection';

export interface Handler<T> {
  handle(): T;
}

export interface HandlerOptions {
  method?:  string;
  path:     string;
}

export function Handler(options: HandlerOptions) {
  const injectable = Injectable({
    inputs:  true,
    tags:    ['handler'],
    meta:    options,
  });
  return injectable;
}
