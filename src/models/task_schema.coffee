_        = require 'underscore'
co       = require 'co'
mongoose = require 'mongoose'
winston  = require 'winston'

DescriptiveModelPlugin  = require '../model-plugins/descriptive_model_plugin'
StatusModelPlugin       = require '../model-plugins/status_model_plugin'
TagableModelPlugin      = require '../model-plugins/tagable_model_plugin'

module.exports = TaskSchema = mongoose.Schema {

  # Reference to the root task.
  rootTask:
    type:         mongoose.Schema.Types.ObjectId
    ref:          'Task'
    required:     yes
    index:        yes

  # Reference to the parent task.
  parentTask:
    type:         mongoose.Schema.Types.ObjectId
    ref:          'Task'

  scheduler:

    kind:
      type:       String
      enum:       ['SINCE_LAST_EXECUTION', 'FIXED_DURATION', 'RUN_ONCE']
      default:    'ONCE'
      required:   yes

    duration:     # in millisecond
      type:       Number

    priority:
      type:       Number
      default:    3

  # Time for next execution
  nextExecution:
    type:         Date
    required:     yes
    default:      Date.now

  # Reference to last execution result.
  lastExecution:
    type:         mongoose.Schema.Types.ObjectId
    ref:          'TaskExecution'

}, collection: 'tasks', discriminatorKey: 'taskType'
  .plugin DescriptiveModelPlugin
  .plugin StatusModelPlugin, choices: [
    'IDLE', 'INACTIVE', 'ERROR', 'EXECUTING', 'DONE'
  ], defaultChoice: 'IDLE'
  .plugin TagableModelPlugin


TaskSchema.pre 'save', (next) ->
  next()


TaskSchema.statics._findNextRunnableTask = -> co =>

  query = {
    'nextExecution':
      '$lte': new Date
    'status': 'IDLE'
  }

  yield @findOneAndUpdate(query, {
    '$set':
      'status': 'LOADING'
  }, {
    new: true, sort:'priority'
  })


TaskSchema.methods.execute = () ->


# Create sub task and return immiedieately.
TaskSchema.methods.createSubTask = (doc) -> co =>
  subTask = yield @Models.Task.create _.extend {}, doc, {
    rootTask:    @rootTask
    parentTask:  @
  }


# Execute sub task and wait for the result.
TaskSchema.methods.subTask = (doc) -> co =>
  # TODO: check task type must be ONCE
  doc.scheduler.kind = 'ONCE'

  subTask    = yield @createSubTask doc
  execution  = null

  yield new Promise (resolve, reject) =>
    count = 0

    checkResult = () => co =>
      return unless subTask.lastExecution?
      execution = yield @Models.TaskExecution.findById t.lastExecution

      if execution.isDone or count++ > 1000
        clearInterval cid
        switch
          when execution.isSuccess then resolve execution.result
          when execution.isFailed  then reject execution.error
          when count > 1000
            reject new Error 'Task running timeout (100s).'

    cid = setInterval checkResult, 100


TaskSchema.methods._start = (execution) -> co =>
  @lastExecution  = execution
  yield @updateStatus 'EXECUTING'


TaskSchema.methods._succeed = (execution, result) -> co =>
  @lastExecution  = execution
  @nextExecution  = switch @scheduler.kind
    when 'ONCE' then null
    when 'SINCE_LAST_EXECUTION'
      new Date(execution.stats.start.getTime() + @scheduler.duration)
    when 'FIXED_DURATION'
      new Date(nextExecution.getTime() + @scheduler.duration)
    else null
  yield execution._succeed result
  yield @updateStatus switch @scheduler.kind
    when 'ONCE' then 'DONE'
    when 'SINCE_LAST_EXECUTION', 'FIXED_DURATION' then 'IDLE'
    else 'ERROR'


TaskSchema.methods._fail = (execution, err) -> co =>
  @lastExecution  = execution
  yield execution._fail err
  yield @updateStatus 'ERROR'
