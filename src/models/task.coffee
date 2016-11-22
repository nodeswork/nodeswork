mongoose = require 'mongoose'

DescriptiveModelPlugin  = require '../model-plugins/descriptive_model_plugin'
StatusModelPlugin       = require '../model-plugins/status_model_plugin'
TagableModelPlugin      = require '../model-plugins/tagable_model_plugin'

TaskSchema = mongoose.Schema {

  scheduler:
    kind:
      enum:       ['SINCE_LAST_EXECUTION', 'ON_BOOT']
      default:    'SINCE_LAST_EXECUTION'
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
    'IDLE', 'INACTIVE', 'ERROR', 'SNOOZED', 'PAUSED', 'LOADING', 'EXECUTING'
  ]
  .plugin TagableModelPlugin


TaskSchema.statics.nextRunnableTask = ->


TaskSchema.methods.execute = (nw) ->


module.exports = Task = mongoose.model 'Task', TaskSchema
