import * as _                               from 'underscore';

import * as logger                          from '@nodeswork/logger';

import { ContextInput }                     from '../inputs';
import { Input, Injectable, PostConstruct } from '../injection';

const LOG = logger.getLogger();

@Injectable({ inputs: true })
export class ContextLogger {

  @Input() context: ContextInput;
  meta: any = {};

  constructor() { }

  @PostConstruct()
  init() {
    this.withMeta({
      _requestId: this.context.requsetId,
    });
  }

  withMeta(meta: any) {
    _.extend(this.meta, meta);
  }

  info(message: string, meta?: any) {
    LOG.info(message, _.extend({}, this.meta, meta));
  }
}
