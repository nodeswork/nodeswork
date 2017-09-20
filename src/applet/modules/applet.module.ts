import { Module }                    from '../module';
import { AppletInfoService }         from '../services';
import { RegisterAppletInfoHandler } from '../handlers';

@Module({
  handlers: [
    RegisterAppletInfoHandler,
  ],
  providers: [
    AppletInfoService,
  ],
})
export class AppletModule {
}
