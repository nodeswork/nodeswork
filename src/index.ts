import * as _ from 'underscore'
import * as Koa from "koa"

import { Nodeswork } from './nodeswork'

import * as accounts from './accounts'
import * as cmpts from './components'


let nodeswork: Nodeswork = new Nodeswork();


let oldAccounts: any = require('./nodeswork-account');
let oldComponents: any = require('./nodeswork-component');


module nodeswork {

  export type INodeswork                 = Nodeswork

  // Exports accounts
  export type NodesworkAccountClass      = accounts.NodesworkAccountClass;
  export type NodesworkAccountOption     = accounts.NodesworkAccountOption;
  export type AccountKoaContext          = accounts.AccountKoaContext;

  export type NodesworkAccount
    <AT extends AccountKoaContext>       = accounts.NodesworkAccount<AT>;
  export type NodesworkAccountManager    = accounts.NodesworkAccountManager;

  // Exports components
  export type NodesworkComponentMap      = cmpts.NodesworkComponentMap;
  export type NodesworkComponentOption   = cmpts.NodesworkComponentOption;
  export type NodesworkComponentClass    = cmpts.NodesworkComponentClass;
  export type NodesworkComponent
    <CT extends Koa.Context>             = cmpts.NodesworkComponent<CT>;
  export type BaseComponentManager
    <CC extends NodesworkComponentClass,
    CO extends NodesworkComponentOption>
                                         = cmpts.BaseComponentManager<CC, CO>;
  export type NodesworkComponentManager  = cmpts.NodesworkComponentManager;

  export type Logger                     = cmpts.Logger;
  export type LoggerClass                = cmpts.LoggerClass;
  export type LoggerKoaContext           = cmpts.LoggerKoaContext;

  export type Request                    = cmpts.Request;
  export type RequestClass               = cmpts.RequestClass;
  export type RequestKoaContext          = cmpts.RequestKoaContext;
}


// TODO: Remove after fully converted to TypeScript.
_.extend(nodeswork, oldAccounts, oldComponents);


export = nodeswork
