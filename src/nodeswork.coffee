_                        = require 'underscore'
Case                     = require 'case'
Koa                      = require 'koa'
KoaRouter                = require 'koa-router'
bodyParser               = require 'koa-bodyparser'
path                     = require 'path'
request                  = require 'request-promise'
url                      = require 'url'
{ logger }               = require 'nodeswork-logger'

{ NodesworkError
  validator }            = require 'nodeswork-utils'

{ PROCESSING_URL_PATH }  = require './constants'

{ Logger }               = require './nodeswork-component/logger'


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
    @router          = new KoaRouter().use @_errorHandler
    @processes       = []
    @accountClazz    = {}
    @componentClazz  = []

    @rootHandler = _.bind @_rootHandler, @
    @viewRootHandler = _.bind @_viewRootHandler, @

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

  withComponent: (componentCls, options={}) ->
    componentCls::nodeswork = @

    for [cls, o], i in @componentClazz
      if componentCls.name == cls.name
        @componentClazz[i] = [componentClazz, options]
        return @

    @componentClazz.push [componentCls, options]
    @

  process: (middlewares...) ->
    Array::push.apply @processes, middlewares
    @router.post.apply(
      @router, [PROCESSING_URL_PATH, @rootHandler].concat middlewares
    )
    @

  view: (viewPath, middlewares...) ->
    @router.get.apply(
      @router
      [path.join("/views", viewPath), @viewRootHandler].concat middlewares
    )

  action: (actionPath, middlewares...) ->
    @router.post.apply(
      @router
      [path.join("/actions", actionPath), @viewRootHandler].concat middlewares
    )

  request: (opts) ->
    @requestClient _.extend {}, opts, {
      url: url.resolve @opts.server, opts.url
    }

  requestDefaults: (opts) ->
    @requestClient = @requestClient.defaults opts

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

    for [cls, options] in @componentClazz
      await cls.initialize(options)

    @app
      .use bodyParser()
      .use @router.routes()
      .use @router.allowedMethods()

    for [cls, options] in @componentClazz
      await cls.initialized(options)

    NodesworkError.meta = {
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

  _operate: (account, opts={}) ->
    @request {
      method:  'POST'
      url:     "/api/v1/applet/user/#{account.user}/accounts/#{account._id}/operate"
      body:    opts
    }

  _createComponents: (ctx) ->
    _.each @componentClazz, ([ cls, options ]) ->
      component             = new cls ctx, options
      name                  = Case.camel(cls.name)
      ctx.components[name]  = component

  _rootHandler: (ctx, next) ->
    response     = {
      name:      @config 'name'
      appletId:  appletId = @config 'appletId'
      params:    ctx.request.body
    }

    validator.isRequired(
      userId = ctx.request.headers.user
      meta:
        path:          'headers.user'
        responseCode:  400
    )
    response.userId            = userId

    try
      {user, userApplet, applet} = await @request {
        method:            'GET'
        url:               "/api/v1/applet-api/#{appletId}/users/#{userId}"
        headers:
          'applet-token':  @config 'appletToken'
      }
      _.extend ctx, user: user, userApplet: userApplet, applet: applet
    catch e
      NodesworkError.fromError e, 'Request user and applet information failed'

    execution       = ctx.request.headers.execution
    request         = ctx.request.headers.request
    ctx.logKey      = execution ? request
    ctx.accounts    = @_parseAccount ctx, userApplet?.accounts ? []
    ctx.nodeswork   = @
    ctx.components  = {}
    @_createComponents ctx

    await next()

    ctx.body = _.extend response, {
      result:    ctx.body
    }

  _viewRootHandler: (ctx, next) ->
    try
      ctx.components  = {}
      @_createComponents ctx
      await next()
    catch e
      ne = NodesworkError.fromError e
      ctx.body = {
        status:    'error'
        error:     ne.toJSON()
      }
      ctx.response.status = ne.meta.responseCode ? 500

  _parseAccount: (ctx, accounts) ->
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

  _errorHandler: (ctx, next) ->
    startTime    = Date.now()
    try
      logger.info 'Receive request', {
        path:    ctx.request.path
        method:  ctx.request.method
      }
      await next()
    catch error
      ne        = NodesworkError.fromError error
      ctx.body  = {
        status:  'error'
        error:   _.omit ne.toJSON(), 'stack'
      }
      logger.error 'Error:', ne.toJSON()
      ctx.response.status = ne.meta.responseCode ? 500
      ctx.response.headers['x-duration'] = Date.now() - startTime


module.exports = nodeswork = _.extend new Nodeswork, {
  Nodeswork: Nodeswork
}
