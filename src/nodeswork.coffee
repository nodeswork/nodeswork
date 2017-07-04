_                            = require 'underscore'
Koa                          = require 'koa'
KoaRouter                    = require 'koa-router'
bodyParser                   = require 'koa-bodyparser'
path                         = require 'path'
request                      = require 'request-promise'
url                          = require 'url'
{ logger }                   = require 'nodeswork-logger'
{ handleRequestMiddleware }  = require 'nodeswork-mongoose'


{ NodesworkError
  NAMED
  validator }                = require 'nodeswork-utils'

{ PROCESSING_URL_PATH
  VIEW_URL_PATH
  ACTION_URL_PATH }          = require './constants'

{ Logger }                   = require './nodeswork-component/logger'

{ NodesworkComponents }      = require './nodeswork-component'


# Base Nodeswork class.
#
# About the configuration
#
# Nodeswork first determine the running env based on the order of
#
#   1. process.env
#   2. class configurations
#
# If the box env is 'DEV', then class configuration has higher priority,
# otherwise, process.env has higher priority.
#
class Nodeswork

  constructor: (@_opts={}) ->
    @opts            = {}
    @config @_opts
    @app             = new Koa
    @router          = new KoaRouter()
    @middlewares     = GET: {}, POST: {}
    @accountClazz    = {}
    @componentClazz  = []

    @router
      .use handleRequestMiddleware
      .use _.bind @_rootHandler, @

    @withComponent Logger


  # Either to config current nodeswork instance, or retrieve a config value.
  #
  # @param opts [Object] config current nodeswork instance.
  # @param opts [String] retrieve the config value for this key.
  config: (opts) ->
    if _.isString(opts) then return @opts[opts]

    _.extend @_opts, opts
    keys    = _.filter _.keys(process.env), (x) -> x.startsWith 'NW_'
    envOpts = _.object _.map keys, (key) -> [key.substring(3), process.env[key]]

    env = envOpts.env ? opts.env ? 'DEV'

    switch env
      when 'DEV' then _.extend @opts, envOpts, opts
      when 'PROD' then _.extend @opts, opts, envOpts

    @opts.env       = env
    @jar            = @opts.jar ? request.jar()
    @requestClient  = request.defaults {
      jar:                 @jar
      followAllRedirects:  true
      json:                true
    }
    @

  withAccount: (accountCls, options={}) ->
    @accountClazz[accountCls.name]   = [accountCls, options]
    accountCls::nodeswork            = @
    @

  withComponent: (componentCls, options={}, overwrite=false) ->
    NodesworkComponents.register @, componentCls, options, overwrite
    @

  process: (middlewares...) ->
    @middlewares.POST[PROCESSING_URL_PATH] ?= []
    @middlewares.POST[PROCESSING_URL_PATH] = (
      @middlewares.POST[PROCESSING_URL_PATH].concat middlewares
    )
    @

  view: (viewPath, middlewares...) ->
    fullPath                    = path.join '/views', viewPath
    @middlewares.GET[fullPath] ?= []
    @middlewares.GET[fullPath]  = @middlewares.GET[fullPath].concat middlewares
    @

  action: (actionPath, middlewares...) ->
    fullPath                    = path.join '/actions', actionPath
    @middlewares.POST[fullPath] ?= []
    @middlewares.POST[fullPath] = @middlewares.POST[fullPath].concat middlewares
    @

  request: (opts) ->
    @requestClient _.extend {}, opts, {
      url: url.resolve @opts.server, opts.url
    }

  requestDefaults: (opts) ->
    @requestClient = @requestClient.defaults opts

  bind: (path, method, middlewares) ->
    names = _.map middlewares, (x) -> x.name || 'unkown'
    logger.info 'Bind router', {
      path:         path
      method:       method
      middlewares:  names
    }
    @router[method.toLowerCase()].apply(
      @router, [path].concat middlewares
    )

  ready: () ->
    return if @isReady

    @config @_opts

    validator.isRequired @opts.server, meta: {
      path: 'nodeswork.config.server'
    }
    validator.isRequired @opts.port, meta: {
      path: 'nodeswork.config.port'
    }
    validator.isRequired @opts.appletId, meta: {
      path: 'nodeswork.config.appletId'
    }

    validator.isRequired @opts.appletToken, meta: {
      path: 'nodeswork.config.appletToken'
    }

    savedMiddlewares  = @middlewares
    @middlewares = GET: {}, POST: {}

    await NodesworkComponents.initialize()

    await NodesworkComponents.initialized()

    for method, targets of savedMiddlewares
      for p, middlewares of targets
        @middlewares[method][p] ?= []
        @middlewares[method][p] = @middlewares[method][p].concat middlewares

    processRootHandler  = NAMED 'processRootHandler', _.bind @_processHandler, @
    viewRootHandler     = NAMED 'viewRootHandler', _.bind @_viewHandler, @
    actionRootHandler   = NAMED 'actionRootHandler', viewRootHandler

    for method, targets of @middlewares
      for p, middlewares of targets
        switch
          when p.startsWith PROCESSING_URL_PATH
            @bind p, method, [processRootHandler].concat middlewares
          when p.startsWith VIEW_URL_PATH
            @bind p, method, [viewRootHandler].concat middlewares
          when p.startsWith ACTION_URL_PATH
            @bind p, method, [actionRootHandler].concat middlewares
          else
            @bind p, method, middlewares

    @app
      .use bodyParser()
      .use @router.routes()
      .use @router.allowedMethods()

    _.extend NodesworkError.meta, {
      server: "http://localhost:#{@config 'port'}"
    }
    @isReady = true
    return

  start: () ->
    @ready()
    new Promise (resolve, reject) =>
      @app.listen @opts.port, (err) =>
          if err? then return reject err
          resolve @

  _rootHandler: (ctx, next) ->
    ctx.nodeswork = @
    ctx.response.headers['nodeswork-processor'] = @config 'name'
    try
      startTime       = Date.now()
      ctx.components  = new NodesworkComponents ctx
      await next()
    finally
      ctx.response.headers['nodeswork-request-duration'] = (
        Date.now() - startTime
      )

  _processHandler: (ctx, next) ->
    ctx.userApplet = ctx.request.body.userApplet
    ctx.execution  = ctx.request.body.execution
    ctx.logKey     = ctx.execution?._id

    validator.isRequired ctx.userApplet, {
      message:        'userApplet is required.'
      meta:
        responseCode: 400
    }

    ctx.accounts    = @_parseAccount ctx, ctx.userApplet.accounts

    await next()

  _viewHandler: (ctx, next) ->
    await next()

  _parseAccount: (ctx, accounts=[]) ->
    _.map accounts, (account) =>
      validator.isRequired @accountClazz[account.accountType], {
        message:        'Missing account class'
        meta:
          accountType:  account.accountType
      }
      [cls, options] = @accountClazz[account.accountType]
      act = new cls options
      _.extend act, account, ctx: ctx
      act


module.exports = nodeswork = _.extend new Nodeswork, {
  Nodeswork
}
