co                       = require 'co'
mongoose                 = require 'mongoose'

StatusModelPlugin        = require '../model-plugins/status_model_plugin'


module.exports = TaskExecutionSchema = mongoose.Schema {

  task:
    type:         mongoose.Schema.Types.ObjectId
    ref:          'Task'
    required:     yes
    index:        yes

  result:         mongoose.Schema.Types.Mixed

  error:          String

  stats:
    start:        Date
    end:          Date

}, collection: 'tasks.executions', discriminatorKey: 'executionType'
  .plugin StatusModelPlugin, choices: [
    'INIT', 'SUCCESS', 'FAILED'
  ], defaultChoice: 'INIT'


TaskExecutionSchema
  .virtual 'isDone'
  .get () -> @status in ['SUCCESS', 'FAILED']


TaskExecutionSchema
  .virtual 'isSuccess'
  .get () -> @status == 'SUCCESS'


TaskExecutionSchema
  .virtual 'isFailed'
  .get () -> @status == 'FAILED'


TaskExecutionSchema.methods._succeed = (result) -> co =>
  @result     = result
  @stats.end  = Date.now()
  yield @updateStatus 'SUCCESS'


TaskExecutionSchema.methods._fail = (err) -> co =>
  @error      = err
  @stats.end  = Date.now()
  yield @updateStatus 'FAILED'
