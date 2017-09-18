import * as logger    from '@nodeswork/logger';

import { Service }    from '../service';

const LOG = logger.getLogger();

@Service()
export class AppletInfoService {

  private appletInfo: AppletInfo = {
    env:          'dev',
    appletToken:  'unkown',
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
