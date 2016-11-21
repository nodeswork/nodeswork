
mongoose              = require 'mongoose'
mongooseSchemaExtend  = require 'mongoose-schema-extend'

TimestampModelPlugin  = require './model-plugins/timestamp_model_plugin'

Nodeswork = ({
  @moduleName     = 'sampleModule'
  components      = {}
} = @options = {}) ->

  @Models        = {}
  @Tasks         = {}
  @ModelPlugins  = {}
  @api           = {}

  @modelPlugin 'Timestamp', TimestampModelPlugin


Nodeswork.prototype.model = (modelName, schema) ->
  @Models[modelName] = mongoose.model modelName, schema


Nodeswork.prototype.modelPlugin = (pluginName, plugin) ->
  @ModelPlugins[pluginName] = plugin
  @


Nodeswork.prototype.task  = (taskName, schema) ->
  @Models[taskName] = @Tasks[taskName] = mongoose.model taskName, schema


Nodeswork.prototype.start = () ->
  @dbConnection  = {}
  @server        = {}


module.exports = nodeswork = new Nodeswork
