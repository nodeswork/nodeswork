
_                       = require 'underscore'
co                      = require 'co'
koa                     = require 'koa'
koaBodyParser           = require 'koa-bodyparser'
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
  @Models[model.modelName] = model

  _.each apiExposed.methods, (method) => switch method
    when 'get'
      @api.get apiExposed.path, apiGetHandler model, apiExposed
    when 'create'
      @api.post(
        emptyUrlPath apiExposed.path, apiExposed.params
        apiPostHandler model, apiExposed
      )
    when 'update'
      @api.post apiExposed.path, apiUpdateHandler model, apiExposed
    when 'delete'
      @api.delete apiExposed.path, apiDeleteHandler model, apiExposed

  @


convertParamsToObject = (params, rules) ->
  _.chain params
    .pairs()
    .filter ([key, val]) -> rules[key]?
    .map ([key, val]) -> [rules[key].substring(1), val]
    .object()
    .value()


emptyUrlPath = (path, rules) ->
  _.each rules, (val, key) ->
    path = path.replace ":#{key}", ""
  path


apiGetHandler = (model, apiExposed) ->
  (ctx) -> co ->
    getQuery = convertParamsToObject ctx.params, apiExposed.params
    res = yield model.findOne(getQuery).exec()
    if res then ctx.body = res
    else ctx.status = 404


apiPostHandler = (model, apiExposed) ->
  (ctx) -> co ->
    doc = yield model.create ctx.request.body
    if doc then ctx.body = doc
    else ctx.status = 404


apiUpdateHandler = (model, apiExposed) ->
  (ctx) -> co ->
    updateQuery = convertParamsToObject ctx.params, apiExposed.params
    res = yield model.findOneAndUpdate updateQuery, ctx.request.body, new: true
    if res then ctx.body = res
    else ctx.status = 404


apiDeleteHandler = (model, apiExposed) ->
  (ctx) -> co ->
    deleteQuery = convertParamsToObject ctx.params, apiExposed.params
    res = yield model.findOneAndRemove deleteQuery
    ctx.status = 202


Nodeswork.prototype.modelPlugin = (pluginName, plugin) ->
  @ModelPlugins[pluginName] = plugin
  @


Nodeswork.prototype.task  = (task, opts) ->
  @model task, opts
  @Tasks[task.modelName] = task
  @


Nodeswork.prototype.start = () ->
  @dbConnection  = {}
  @server        = new koa()
  @server
    .use koaBodyParser()
    .use @api.routes()
    .use @api.allowedMethods()

  @server.listen 5555

  console.log 'Server is listing on port 5555.'


module.exports = nodeswork = new Nodeswork
