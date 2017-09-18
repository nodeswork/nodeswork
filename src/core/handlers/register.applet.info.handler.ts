import { Handler }           from '../handler';
import { Input }             from '../injection';
import { ContextInput }      from '../inputs';
import { AppletInfoService } from '../services/applet.info.service';
import { ContextLogger }     from '../providers/context.logger';

@Handler({
  path:    '/register-applet-info',
  method:  'POST',
})
export class RegisterAppletInfoHandler implements Handler<void> {

  @Input() context: ContextInput;
  @Input() logger: ContextLogger;

  constructor(
    private appletInfoService: AppletInfoService,
  ) { }

  handle() {
    this.logger.info('Register new applet info', this.context.ctx.request.body);
    this.appletInfoService.registerAppletInfo({
      env:          this.context.ctx.request.body.env,
      appletToken:  this.context.ctx.request.body['applet-token'],
    });
  }
}
