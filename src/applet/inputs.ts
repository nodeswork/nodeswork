import * as Router from 'koa-router';
import * as mongoose from 'mongoose';

export class ContextInput {

  public ctx:        Router.IRouterContext;
  public requsetId:  string = mongoose.Types.ObjectId().toString();

  constructor() { }
}
