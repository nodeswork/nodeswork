var ExecutionCounterTask, ExecutionCounterTaskSchema, User, UserSchema, co, nodeswork, nw;

co = require('co');

nodeswork = require('../lib/index');

nw = new nodeswork.Nodeswork({
  moduleName: 'simple_server'
});

UserSchema = nodeswork.mongoose.Schema({
  username: String
}, {
  collection: 'users'
});

User = nodeswork.mongoose.model('User', UserSchema);

nw.model(User, {
  apiExposed: {
    methods: ['get', 'create', 'update', 'delete'],
    urlName: 'User',
    path: '/users/:userId',
    params: {
      userId: '@_id'
    }
  }
});

ExecutionCounterTaskSchema = nw.Models.Task.schema.extend({
  numOfExecutions: {
    type: Number,
    "default": 0
  }
});

ExecutionCounterTaskSchema.methods.execute = function(nw) {
  console.log('?????????????????????????????', this.numOfExecutions);
  return this.numOfExecutions++;
};

ExecutionCounterTask = nodeswork.mongoose.model('ExecutionCounterTask', ExecutionCounterTaskSchema);

nw.task(ExecutionCounterTask);

co(function*() {
  var ins, task;
  ins = (yield ExecutionCounterTask.findOne({}));
  if (ins == null) {
    task = (yield ExecutionCounterTask.create({
      scheduler: {
        kind: 'SINCE_LAST_EXECUTION',
        duration: 10000,
        priority: 3
      }
    }));
  }
  ins.status = 'IDLE';
  yield ins.save();
  return nw.Models.Task.startTaskExecutor();
});

nw.start();
