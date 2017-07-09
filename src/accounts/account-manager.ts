import { validator, NodesworkError } from "@nodeswork/utils"

import { BaseComponentManager } from '../components'

import {
  NodesworkAccount,
  NodesworkAccountClass,
  AccountKoaContext,
  NodesworkAccountOption } from './account'


export class NodesworkAccountManager
extends BaseComponentManager<NodesworkAccountClass, NodesworkAccountOption> {

  classMap: {
    [name: string]: [NodesworkAccountClass, NodesworkAccountOption]
  } = {}

  register(
    clazz: NodesworkAccountClass, options: NodesworkAccountOption,
    overwrite: boolean = false
  ): void {
    super.register(clazz, options, overwrite);
    this.classMap[clazz.name] = [clazz, options];
  }

  async parseAccounts(
    ctx: AccountKoaContext,
    accounts: Array<any> = []
  ): Promise<Array<NodesworkAccount<AccountKoaContext>>> {

    for (let account of accounts) {

      let accountType: string = account.accountType;

      validator.isRequired(accountType, {
        message:       'Missing account class',
        meta: {
          accountType: accountType,
        },
      });
      validator.isRequired(this.classMap[accountType], {
        message:       'Missing account class',
        meta: {
          accountType: accountType,
        },
      });

      let [clazz, options] = this.classMap[accountType];

      account.__proto__ = Object.create({
        ctx: ctx,
      }, clazz.prototype);
    }

    return accounts;
  }
}
