export const moduleMetadataKey = Symbol('nw:module');

export interface NwModuleOptions {
  depends?:  object[];
  workers?:  object[];
  accounts?: object[];
  services?: object[];
}
