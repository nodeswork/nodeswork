import * as _ from 'underscore'
import * as request from 'request-promise'

import { NodesworkError } from '@nodeswork/utils'

import {
  RequestAPI
  RequestOption } from './globals'
import {
  NodesworkAccountClass,
  NodesworkAccountOption,
  NodesworkAccountManager } from './accounts'
import {
  NodesworkComponentClass,
  NodesworkComponentManager,
  NodesworkComponentOption } from './components'


export interface Nodeswork {

  request(options: any): any;
}


export interface NodesworkOption {
  env?:         string
  server:       string
  port:         number
  appletId:     string
  appletToken:  string
}


export class Nodeswork {

  accountManager:    NodesworkAccountManager
  componentManager:  NodesworkComponentManager
  _options:          any = {}
  requestClient:     RequestAPI

  constructor(options: NodesworkOption = null) {
    this.accountManager   = new NodesworkAccountManager(this);
    this.componentManager = new NodesworkComponentManager(this);

    if (options != null) {
      this.config(options);
    }
  }

  /**
   * Either to config current nodeswork instance, or retrieve a config value.
   *
   * @param {NodesworkOption} options - config current nodeswork instance.
   * @param {string} options - retrieve the config value for this key.
   */
  config(options: NodesworkOption | string): Nodeswork | any {
    if (_.isString(options)) {
      return this._options[options];
    }

    let env: string = process.env.NODE_ENV || options.env || 'development';

    let envOptions = _.chain(process.env)
      .keys()
      .filter((x) => x.startsWith('NW_'))
      .map((x) => [x.substring(3), process.env[x]]) // len('NW_') == 3
      .object()
      .value();
    let localOptions = _.omit(options, 'env');

    switch (env) {
      case 'production':
        _.extend(this._options, localOptions, envOptions, {
          env: env,
        });
        break;
      case 'development':
      case 'test':
        _.extend(this._options, envOptions, localOptions, {
          env: env,
        });
        break;
      default:
        throw new NodesworkError('Unkown env when initializing nodeswork', {
          env:  env,
          path: 'nodeswork.options.env',
        });
    }

    if (!this._options.jar) {
      this._options.jar = request.jar();
    }

    this.requestClient = request.defaults({
      jar:                 this._options.jar,
      followAllRedirects:  true,
      json:                true
    });
  }

  /**
   * Register a new account.
   */
  withAccount(
    clazz: NodesworkAccountClass, options: NodesworkAccountOption,
    overwrite = false
  ): Nodeswork {
    this.accountManager.register(clazz, options, overwrite);
    return this;
  }

  /**
   * Register a new component.
   */
  withComponent(
    clazz: NodesworkComponentClass, options: NodesworkComponentOption,
    overwrite = false
  ): Nodeswork {
    this.componentManager.register(clazz, options, overwrite);
    return this;
  }

  /**
   * Send request using the client.
   */
  async request(options: RequestOption): Promise<any> {
    return await this.requestClient(options);
  }

  /**
   * Set the default options for the request client.
   */
  requestDefaults(options: RequestOption): Nodeswork {
    this.requestClient = this.requestClient.defaults(options);
    return this;
  }
}
