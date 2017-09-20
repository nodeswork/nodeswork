import * as kiws             from '../../kiws';

import { AppletInfoService } from '../services/applet.info.service';

@kiws.Handler({
})
export class RegisterAppletInfoHandler {

  // @kiws.Input() context: ContextInput;
  // @kiws.Input() logger: ContextLogger;

  constructor(
    private appletInfoService: AppletInfoService,
  ) { }

  @kiws.Endpoint({
    path:    '/register-applet-info',
    method:  'POST',
  })
  registerAppletInfo() {
    // this.logger.info('Register new applet info', this.context.ctx.request.body);
    // this.appletInfoService.registerAppletInfo({
      // env:          this.context.ctx.request.body.env,
      // appletToken:  this.context.ctx.request.body['applet-token'],
    // });
  }
}
