co       = require 'co'
mongoose = require 'mongoose'

DescriptiveModelPlugin  = require '../model-plugins/descriptive_model_plugin'
StatusModelPlugin       = require '../model-plugins/status_model_plugin'
TagableModelPlugin      = require '../model-plugins/tagable_model_plugin'

TaskSchema = mongoose.Schema {

  scheduler:
    kind:
      enum:       ['SINCE_LAST_EXECUTION', 'SINCE_NEXT_EXECUTION']
    duration:     # in millisecond
      type:       Number
    priority:
      type:       Number
      default:    3

  lastExecution:  Date
  nextExecution:  Date

}, collection: 'tasks', discriminatorKey: 'taskType'
  .plugin DescriptiveModelPlugin
  .plugin StatusModelPlugin, choices: [
    'IDLE', 'INACTIVE', 'ERROR', 'SNOOZED', 'PAUSED', 'LOADING', 'EXECUTING',
    'EXHAUSTED'
  ], defaultChoice: 'INACTIVE'
  .plugin TagableModelPlugin


TaskSchema.pre 'save', (next) ->
  if @status == 'IDLE'
    @nextExecution ?= Date.now()
  next()


TaskSchema.statics.startTaskExecutor = ->

  setInterval ( => co =>
    nxtTask = yield @nextRunnableTask()
    if nxtTask? then yield nxtTask.runAsNextTask()
  ), 1000


TaskSchema.statics.nextRunnableTask = -> co =>

  query = {
    'nextExecution':
      '$lte': Date.now()
    'status': 'IDLE'
  }

  yield @findOneAndUpdate(query, {
    '$set':
      'status': 'LOADING'
  }, {
    new: true, sort:'priority'
  })


TaskSchema.methods.runAsNextTask = (nw) -> co =>
  @status = 'EXECUTING'
  yield @save()
  try
    @execute()
    yield @success()
  catch e
    yield @failed e
  @


TaskSchema.methods.execute = (nw) ->


TaskSchema.methods.success = () -> co =>
  @lastExecution = Date.now()
  @status = 'IDLE'
  @nextExecution = new Date(@lastExecution.getTime() + @scheduler.duration)
  yield @save()


TaskSchema.methods.failed = (err) ->
  @status = 'ERROR'
  yield @save()


TaskSchema.methods.pause = () ->
  @status = 'PAUSED'
  yield @save()


module.exports = Task = mongoose.model 'Task', TaskSchema
