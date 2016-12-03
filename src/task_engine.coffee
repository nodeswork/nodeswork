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

  setInterval ( => co =>
    if (nxtTask = yield @Models.Task._findNextRunnableTask())?
      winston.info "Found one runnable task: #{nxtTask._id}."
      yield @executeTask nxtTask
  ), @options.duration


TaskEngine.prototype.executeTask = (task) -> co =>
  winston.info "Start to execute task: #{task._id} (#{task.description})."

  execution = yield @Models.TaskExecution.create {
    task:     task
    stats:
      start:  Date.now()
  }
  yield task._start @nw, execution

  try
    result = yield task.execute @nw
    yield task._succeed execution, result
    winston.error "Task #{task._id} finished."
  catch e
    winston.error "Task #{task._id} FAILED.", e
    yield task._fail execution, e
