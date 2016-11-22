
_                       = require 'underscore'
co                      = require 'co'
koa                     = require 'koa'
koaRouter               = require 'koa-router'
mongoose                = require 'mongoose'
mongooseSchemaExtend    = require 'mongoose-schema-extend'

DescriptiveModelPlugin  = require './model-plugins/descriptive_model_plugin'
StatusModelPlugin       = require './model-plugins/status_model_plugin'
TagableModelPlugin      = require './model-plugins/tagable_model_plugin'
TimestampModelPlugin    = require './model-plugins/timestamp_model_plugin'

Task                    = require './models/task'


mongoose.Promise        = global.Promise

mongoose.connect 'mongodb://localhost/test'

process.on 'uncaughtException', (err) ->
  console.log 'uncaughtException', err


Nodeswork = ({
  @moduleName     = 'sampleModule'
  components      = {}
} = @options = {}) ->

  @Models        = {}
  @Tasks         = {}
  @ModelPlugins  = {}
  @api           = koaRouter prefix: '/api/v1'

  @
    .modelPlugin 'Descriptive', DescriptiveModelPlugin
    .modelPlugin 'Status', StatusModelPlugin
    .modelPlugin 'Tagable', TagableModelPlugin
    .modelPlugin 'Timestamp', TimestampModelPlugin

    .model Task


Nodeswork.prototype.Nodeswork = Nodeswork


Nodeswork.prototype.model = (model, {
  apiExposed = {
    methods: []
    urlName: null
    path:    null
    params:  {}
  }
} = {}) ->
  console.log 'apiExposed', apiExposed
  @Models[model.name] = model

  _.each apiExposed.methods, (method) => switch method
    when 'get'
      @api.get apiExposed.path, (ctx) => co =>
        getQuery = convertParamsToObject ctx.params, apiExposed.params
        res = yield model.findOne(getQuery).exec()
        ctx.body = res

  @

convertParamsToObject = (params, rules) ->
  _.chain params
    .pairs()
    .filter ([key, val]) -> rules[key]?
    .map ([key, val]) -> [rules[key].substring(1), val]
    .object()
    .value()


Nodeswork.prototype.modelPlugin = (pluginName, plugin) ->
  @ModelPlugins[pluginName] = plugin
  @


Nodeswork.prototype.task  = (task) ->
  @Models[task.name] = @Tasks[task.name] = task
  @


Nodeswork.prototype.start = () ->
  @dbConnection  = {}
  @server        = new koa()
  @server
    .use @api.routes()
    .use @api.allowedMethods()

  @server.listen 5555


module.exports = nodeswork = new Nodeswork
