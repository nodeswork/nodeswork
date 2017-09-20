import * as _         from 'underscore';

import { Injectable } from './injection';

const SERVICE_TAGS = [ 'service', 'provider' ];

/**
 * Service is global singleton instance, which doesn't take any inputs.
 */
export function Service(options: { tags?: string[], meta?: object } = {}) {
  return Injectable({
    tags: _.union(SERVICE_TAGS, options.tags || []),
    meta: options.meta,
  });
}
