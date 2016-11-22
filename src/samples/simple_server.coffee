
co        = require 'co'
mongoose  = require 'mongoose'

nodeswork = require '../index'


nw = new nodeswork.Nodeswork {
  moduleName: 'simple_server'
}


UserSchema = mongoose.Schema {
  username: String
}, collection: 'users'

User = mongoose.model 'User', UserSchema

nw.model User, {
  apiExposed:
    methods: ['get', 'create', 'update', 'delete']
    urlName: 'User'
    path: '/users/:userId'
    params:
      userId: '@_id'
}


ExecutionCounterTaskSchema = nw.Models.Task.schema.extend {

  numOfExecutions:
    type:           Number
    default:        0
}


ExecutionCounterTaskSchema.methods.execute = (nw) ->
  console.log '?????????????????????????????', @numOfExecutions
  @numOfExecutions++


ExecutionCounterTask = mongoose.model 'ExecutionCounterTask', ExecutionCounterTaskSchema


nw.task ExecutionCounterTask


co ->
  ins = yield ExecutionCounterTask.findOne {}
  unless ins?
    task = yield ExecutionCounterTask.create {
      scheduler:
        kind:      'SINCE_LAST_EXECUTION'
        duration:  10000
        priority:  3
    }

  ins.status = 'IDLE'

  yield ins.save()

  nw.Models.Task.startTaskExecutor()


nw.start()
