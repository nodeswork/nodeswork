import { Handler }           from '../handler';
import { Input }             from '../injection';
import { ContextInput }      from '../inputs';
import { AppletInfoService } from '../services/applet.info.service';

@Handler({
  path:    '/register-applet-info',
  method:  'POST',
})
export class RegisterAppletInfoHandler implements Handler<void> {

  @Input() context: ContextInput;

  constructor(
    private appletInfoService: AppletInfoService,
  ) { }

  handle() {
    this.appletInfoService.registerAppletInfo({
      env:          this.context.ctx.request.body.env,
      appletToken:  this.context.ctx.request.body['applet-token'],
    });
  }
}
