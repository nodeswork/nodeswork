
mongoose              = require 'mongoose'
mongooseSchemaExtend  = require 'mongoose-schema-extend'

DescriptiveModelPlugin  = require './model-plugins/descriptive_model_plugin'
StatusModelPlugin       = require './model-plugins/status_model_plugin'
TagableModelPlugin      = require './model-plugins/tagable_model_plugin'
TimestampModelPlugin    = require './model-plugins/timestamp_model_plugin'

Task                    = require './models/task'

Nodeswork = ({
  @moduleName     = 'sampleModule'
  components      = {}
} = @options = {}) ->

  @Models        = {}
  @Tasks         = {}
  @ModelPlugins  = {}
  @api           = {}

  @
    .modelPlugin 'Descriptive', DescriptiveModelPlugin
    .modelPlugin 'Status', StatusModelPlugin
    .modelPlugin 'Tagable', TagableModelPlugin
    .modelPlugin 'Timestamp', TimestampModelPlugin

    .model Task


Nodeswork.prototype.model = (model) ->
  @Models[model.name] = model
  @


Nodeswork.prototype.modelPlugin = (pluginName, plugin) ->
  @ModelPlugins[pluginName] = plugin
  @


Nodeswork.prototype.task  = (task) ->
  @Models[task.name] = @Tasks[task.name] = task
  @


Nodeswork.prototype.start = () ->
  @dbConnection  = {}
  @server        = {}


module.exports = nodeswork = new Nodeswork
