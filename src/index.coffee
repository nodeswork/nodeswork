
_                       = require 'underscore'
co                      = require 'co'
koa                     = require 'koa'
koaBodyParser           = require 'koa-bodyparser'
koaRouter               = require 'koa-router'
mongoose                = require 'mongoose'
mongooseSchemaExtend    = require 'mongoose-schema-extend'
winston                 = require 'winston'

DescriptiveModelPlugin  = require './model-plugins/descriptive_model_plugin'
StatusModelPlugin       = require './model-plugins/status_model_plugin'
TagableModelPlugin      = require './model-plugins/tagable_model_plugin'
TimestampModelPlugin    = require './model-plugins/timestamp_model_plugin'

Task                    = require './models/task'


mongoose.Promise        = global.Promise

process.on 'uncaughtException', (err) ->
  console.log 'uncaughtException', err


defaultOptions = {
  moduleName:  'sampleModule'
  dbAddress:   'mongodb://localhost/test'
}

Nodeswork = (@options = {}) ->
  _.defaults @options, defaultOptions
  {
    @moduleName
  } = @options

  @Models        = {}
  @Tasks         = {}
  @ModelPlugins  = {}
  @api           = koaRouter prefix: '/api/v1'

  @mongoose      = new mongoose.Mongoose

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
      winston.info "Bind API: [GET]  #{apiExposed.path}"
      @api.get apiExposed.path, apiGetHandler model, apiExposed
    when 'create'
      winston.info "Bind API: [POST]
        #{emptyUrlPath apiExposed.path, apiExposed.params}"
      @api.post(
        emptyUrlPath apiExposed.path, apiExposed.params
        apiCreateHandler model, apiExposed
      )
    when 'update'
      winston.info "Bind API: [POST] #{apiExposed.path}"
      @api.post apiExposed.path, apiUpdateHandler model, apiExposed
    when 'delete'
      winston.info "Bind API: [DELETE] #{apiExposed.path}"
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
    winston.info "Get call to Auto-gen model handler: #{model.modelName}"
    getQuery = convertParamsToObject ctx.params, apiExposed.params
    res = yield model.findOne(getQuery).exec()
    if res then ctx.body = res
    else ctx.status = 404


apiCreateHandler = (model, apiExposed) ->
  (ctx) -> co ->
    console.log ctx.request.body
    winston.info "Create call to Auto-gen model handler: #{model.modelName}", ctx.request.body
    doc = yield model.create ctx.request.body
    console.log 'doc', doc
    if doc then ctx.body = doc
    else ctx.status = 404


apiUpdateHandler = (model, apiExposed) ->
  (ctx) -> co ->
    winston.info "Update call to Auto-gen model handler: #{model.modelName}"
    updateQuery = convertParamsToObject ctx.params, apiExposed.params
    res = yield model.findOneAndUpdate updateQuery, ctx.request.body, new: true
    if res then ctx.body = res
    else ctx.status = 404


apiDeleteHandler = (model, apiExposed) ->
  (ctx) -> co ->
    winston.info "Delete call to Auto-gen model handler: #{model.modelName}"
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
  @mongoose.connection.once 'open', ->
    winston.info 'Mongoose connection has been established.'
  @mongoose.connect @options.dbAddress

  @server        = new koa()
  @server
    .use koaBodyParser()
    .use @api.routes()
    .use @api.allowedMethods()

  @server.listen 5555

  winston.info 'Server is listing on port 5555.'


module.exports = nodeswork = new Nodeswork
