var ExecutionCounterTaskSchema, UserSchema, co, nodeswork, nw;

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

nw.model('User', UserSchema, {
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

nw.task('ExecutionCounterTask', ExecutionCounterTaskSchema);

co(function*() {
  var ins, task;
  ins = (yield nw.Tasks.ExecutionCounterTask.findOne({}));
  if (ins == null) {
    task = (yield nw.Tasks.ExecutionCounterTask.create({
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
