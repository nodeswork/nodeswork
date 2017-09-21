import { Module }                    from '../module';
import { AppletInfoService }         from '../services';
import { RegisterAppletInfoHandler } from '../handlers';
import {
  AccountInputProvider,
  OAuthAccount,
  TwitterAccount,
}                                    from '../accounts';

@Module({
  handlers: [
    RegisterAppletInfoHandler,
  ],
  inputs: [
    AccountInputProvider,
  ],
  providers: [
    AppletInfoService,
    OAuthAccount,
    TwitterAccount,
  ],
})
export class AppletModule {
}
