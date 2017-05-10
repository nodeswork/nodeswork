_        = require 'underscore'
co       = require 'co'
winston  = require 'winston'

defaultOptions = {
  duration:    1000
  nw:          null  # reference to nodeswork instance.
}

module.exports = TaskEngine = (@options) ->

  _.defaults @options, defaultOptions

  @nw      = @options.nw
  @Models  = @options.nw.Models

  winston.info 'Task engine started.'

  setInterval ( => co =>
    try
      if (nxtTask = yield @Models.Task._findNextRunnableTask())?
        winston.info "Found one runnable task: #{nxtTask._id}."
        yield @executeTask nxtTask
    catch err
      winston.error 'Task runs failed.', err
  ), @options.duration



TaskEngine.prototype.executeTask = (task) -> co =>
  winston.info "Start to execute task: #{task._id} (Description: #{task.description})."

  execution = yield @Models.TaskExecution.create {
    task:     task
    stats:
      start:  Date.now()
  }
  yield task._start execution

  try
    result = yield task.execute()
    yield task._succeed execution, result
    winston.info "Task #{task._id} finished."
  catch e
    winston.error "Task #{task._id} FAILED.", e
    console.error e
    yield task._fail execution, e
