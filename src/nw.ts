import { NodesworkAccountClass } from './accounts'
import { NodesworkComponentClass, NodesworkComponentOption } from './components'

export interface Nodeswork {

  request(options: any): any;
}


export interface NodesworkOption {
}


export class Nodeswork {

  constructor() {
  }

  config(options: NodesworkOption) {
  }

  withAccount(clazz: NodesworkAccountClass, options: any): Nodeswork {
    return this;
  }

  withComponent(
    clazz: NodesworkComponentClass, options: NodesworkComponentOption
  ): Nodeswork {
    return this;
  }
}
