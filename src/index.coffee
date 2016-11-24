_                       = require 'underscore'
co                      = require 'co'
koa                     = require 'koa'
koaBodyParser           = require 'koa-bodyparser'
koaRouter               = require 'koa-router'
mongoose                = require 'mongoose'
mongooseSchemaExtend    = require 'mongoose-schema-extend'
owlDeepcopy             = require 'owl-deepcopy'
winston                 = require 'winston'

DescriptiveModelPlugin  = require './model-plugins/descriptive_model_plugin'
StatusModelPlugin       = require './model-plugins/status_model_plugin'
TagableModelPlugin      = require './model-plugins/tagable_model_plugin'
TimestampModelPlugin    = require './model-plugins/timestamp_model_plugin'

TaskSchema              = require './models/task'


mongoose.Promise        = global.Promise

process.on 'uncaughtException', (err) ->
  console.log 'uncaughtException', err


defaultOptions = {
  moduleName:  'sampleModule'
  dbAddress:   'mongodb://localhost/test'
}

Nodeswork = (@options = {}) ->
  _.defaults @options, defaultOptions

  @Models        = {}
  @Tasks         = {}
  @ModelPlugins  = {}
  @api           = koaRouter()
  @router        = koaRouter()

  @mongoose      = new mongoose.Mongoose
  @server        = new koa()

  @
    .modelPlugin 'Descriptive', DescriptiveModelPlugin
    .modelPlugin 'Status', StatusModelPlugin
    .modelPlugin 'Tagable', TagableModelPlugin
    .modelPlugin 'Timestamp', TimestampModelPlugin

    .model 'Task', TaskSchema


Nodeswork.prototype.Nodeswork = Nodeswork


Nodeswork.prototype.extend = (options = {}) ->
  newNW = owlDeepcopy.deepCopy @
  _.extend newNW.options, options
  newNW.mongoose = @mongoose
  newNW.server   = @server
  newNW


Nodeswork.prototype.model = (modelName, modelSchema, {
  apiExposed = {}
} = {}) ->
  winston.info "Registering model #{modelName}."

  _.defaults apiExposed, {
    methods:      []
    urlName:      null
    path:         null
    params:       {}
    superDoc:     () -> {}
    middlewares:  {}
  }
  _.defaults apiExposed.middlewares, {
    all:          []
    create:       []
    get:          []
    update:       []
    find:         []
    delete:       []
  }

  modelSchema.statics.Models = @Models
  modelSchema.statics.Tasks  = @Tasks
  modelSchema.virtual 'Models'
    .get => @Models
  modelSchema.virtual 'Tasks'
    .get => @Tasks
  @Models[modelName] = model = @mongoose.model modelName, modelSchema

  _.each apiExposed.methods, (method) => switch method
    when 'get'
      winston.info "Bind API: [GET]  #{apiExposed.path}"
      @bindApi(
        'get', apiExposed.path,
        apiExposed.middlewares.all, apiExposed.middlewares.get,
        apiGetHandler model, apiExposed
      )
    when 'find'
      winston.info "Bind API: [GET]
        #{emptyUrlPath apiExposed.path, apiExposed.params}"
      @bindApi(
        'post'
        emptyUrlPath apiExposed.path, apiExposed.params
        apiExposed.middlewares.all, apiExposed.middlewares.find
        apiFindHandler model, apiExposed
      )
    when 'create'
      winston.info "Bind API: [POST]
        #{emptyUrlPath apiExposed.path, apiExposed.params}"
      @bindApi(
        'post'
        emptyUrlPath apiExposed.path, apiExposed.params
        apiExposed.middlewares.all, apiExposed.middlewares.create
        apiCreateHandler model, apiExposed
      )
    when 'update'
      winston.info "Bind API: [POST] #{apiExposed.path}"
      @bindApi(
        'post', apiExposed.path
        apiExposed.middlewares.all, apiExposed.middlewares.update
        apiUpdateHandler model, apiExposed
      )
    when 'delete'
      winston.info "Bind API: [DELETE] #{apiExposed.path}"
      @bindApi(
        'delete', apiExposed.path,
        apiExposed.middlewares.all, apiExposed.middlewares.delete
        apiDeleteHandler model, apiExposed
      )

  @


Nodeswork.prototype.bindApi = (method, path, middlewares..., handler) ->
  args = _.flatten [path].concat middlewares, [handler]
  @api[method].apply @api, args


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
    getQuery = _.extend(
      apiExposed.superDoc ctx
      convertParamsToObject ctx.params, apiExposed.params
    )
    res = yield model.findOne(getQuery).exec()
    if res then ctx.body = res
    else ctx.status = 404


apiFindHandler = (model, apiExposed) ->
  (ctx) -> co ->
    winston.info "Find call to Auto-gen model handler: #{model.modelName}"
    findQuery = _.extend(
      apiExposed.superDoc ctx
      convertParamsToObject ctx.params, apiExposed.params
      ctx.query
    )
    res = yield model.find(findQuery).exec()
    if res then ctx.body = res
    else ctx.status = 404


apiCreateHandler = (model, apiExposed) ->
  (ctx) -> co ->
    winston.info "Create call to Auto-gen model handler: #{model.modelName}", ctx.request.body
    doc = yield model.create _.extend(
      apiExposed.superDoc ctx
      ctx.request.body
    )
    if doc then ctx.body = doc
    else ctx.status = 404


apiUpdateHandler = (model, apiExposed) ->
  (ctx) -> co ->
    winston.info "Update call to Auto-gen model handler: #{model.modelName}"
    updateQuery = _.extend(
      apiExposed.superDoc ctx
      convertParamsToObject ctx.params, apiExposed.params
    )
    res = yield model.findOneAndUpdate(
      updateQuery
      _.extend apiExposed.superDoc(ctx), ctx.request.body
      new: true
    )
    if res then ctx.body = res
    else ctx.status = 404


apiDeleteHandler = (model, apiExposed) ->
  (ctx) -> co ->
    winston.info "Delete call to Auto-gen model handler: #{model.modelName}"
    deleteQuery = _.extend(
      apiExposed.superDoc ctx
      convertParamsToObject ctx.params, apiExposed.params
    )
    res = yield model.findOneAndRemove deleteQuery
    ctx.status = 202


Nodeswork.prototype.modelPlugin = (pluginName, plugin) ->
  @ModelPlugins[pluginName] = plugin
  @


Nodeswork.prototype.task  = (taskName, taskSchema, opts) ->
  winston.info "Registering task #{taskName}."
  @model taskName, taskSchema, opts
  @Tasks[taskName] = @Models[taskName]
  @



Nodeswork.prototype.start = () ->
  @mongoose.connection.once 'open', ->
    winston.info 'Mongoose connection has been established.'
  @mongoose.connect @options.dbAddress

  @router.use '/api/v1', @api.routes(), @api.allowedMethods()
  @router.get '/status', (ctx) -> ctx.body = 'ok'
  @server
    .use koaBodyParser()
    .use @router.routes()
    .use @router.allowedMethods()

  @server.listen 5555

  winston.info 'Server is listing on port 5555.'

  @Models.Task.startTaskExecutor()


module.exports = nodeswork = new Nodeswork
