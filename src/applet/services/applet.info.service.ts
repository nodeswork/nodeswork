import * as logger from '@nodeswork/logger';

import * as kiws   from '../../kiws';

const LOG = logger.getLogger();

@kiws.Service()
export class AppletInfoService {

  private appletInfo: AppletInfo = {
    env:          'dev',
    appletToken:  'unset',
  };

  constructor() { }

  registerAppletInfo(info: AppletInfo) {
    this.appletInfo = info;
  }

  getAppletInfo() {
    return this.appletInfo;
  }
}

export interface AppletInfo {
  env:          string;
  appletToken:  string;
}
