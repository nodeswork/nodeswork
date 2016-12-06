var _, ExecutionCounterTaskSchema, UserSchema, co, nodeswork, nw, fs, stream;

_  = require('underscore');
co = require('co');
fs = require('fs');
stream = require('stream');

nodeswork = require('../lib/index');

nw = nodeswork.extend({
  moduleName:         'simple_server',
  components: {
    database:         true,
    server:           true,
    tasks:            true
  }
});

console.log('???', _.keys(nodeswork.Models));
console.log('???xxx', _.keys(nw.Models));

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

ExecutionSubTaskSchema = nw.Models.Task.schema.extend({
});

ExecutionSubTaskSchema.methods.execute = function* () {
  console.log("SUB IS BEING EXECUTE.");
  return 12345;
};

ExecutionCounterTaskSchema = nw.Models.Task.schema.extend({
  numOfExecutions: {
    type: Number,
    "default": 0
  }
});

ExecutionCounterTaskSchema.methods.execute = function* () {
  var subValue = yield this.subTask(this.Models.ExecutionSubTask, {});
  console.log('Execution:', this.numOfExecutions, 'sub:', subValue);

  s = new stream.Readable;
  s.push("content " + this.numOfExecutions);
  s.push(null);

  ws = nw.gfs.createWriteStream();

  piped = s.pipe(ws);

  ws.on('close', function (file) {
    rs = nw.gfs.createReadStream({_id: ws.id});
    rs.pipe(process.stdout);
  });


  return this.numOfExecutions++;
};

nw.task('ExecutionSubTask', ExecutionSubTaskSchema);
nw.task('ExecutionCounterTask', ExecutionCounterTaskSchema);

co(function*() {
  var ins, task;
  ins = (yield nw.Tasks.ExecutionCounterTask.findOne({}));
  if (ins == null) {
    ins = (yield nw.Tasks.ExecutionCounterTask.create({
      scheduler: {
        kind: 'SINCE_LAST_EXECUTION',
        duration: 10000,
        priority: 3
      }
    }));
  }
  ins.status = 'IDLE';
  yield ins.save();
})
.catch(function (err) {
  console.log('err', err);
});

nw.start();
