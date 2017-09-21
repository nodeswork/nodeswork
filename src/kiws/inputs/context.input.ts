import * as Router                              from 'koa-router';
import * as mongoose                            from 'mongoose';

import { InputProvider, InputGenerator, Input } from '../input';

@InputProvider({})
export class ContextInputProvider {

  @InputGenerator({})
  generateContextInput(ctx: Router.IRouterContext): Input {
    return {
      type: 'ContextInput',
      data: { ctx },
    };
  }
}

export class ContextInput {
  public ctx:        Router.IRouterContext;
  public requsetId:  string = mongoose.Types.ObjectId().toString();
}
