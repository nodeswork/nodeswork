_                   = require 'underscore'
Case                = require 'case'
Koa                 = require 'koa'
KoaRouter           = require 'koa-router'
bodyParser          = require 'koa-bodyparser'
request             = require 'request-promise'
url                 = require 'url'

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
    @router          = new KoaRouter
    @processes       = []
    @accountClazz    = {}
    @componentClazz  = {}

    @router
      .post PROCESSING_URL_PATH, _.bind fetchRequiredInformation, null, @


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

    @opts.env = env
    @jar      = @opts.jar ? request.jar()
    @

  withAccount: (accountClazz...) ->
    _.each accountClazz, (cls) =>
      @accountClazz[cls.name]  = cls
      cls::nodeswork           = @
    @

  withComponent: (components...) ->
    _.each components, (cls) =>
      @componentClazz[cls.name]   = cls
      cls::nodeswork              = @
    @

  process: (middlewares...) ->
    Array::push.apply @processes, middlewares
    @router.post.apply @router, [PROCESSING_URL_PATH].concat middlewares
    @

  view: (path, middlewares...) ->

  request: (opts) ->
    @requestClient _.extend {}, opts, {
      url: url.resolve @opts.server, opts.url
    }

  requestDefaults: (opts) ->
    @requestClient = @requestClient.defaults opts

  start: (cb) ->
    @config @_opts

    unless @opts.server?
      throw new Error "Required configuration 'server' is missing."

    unless @opts.port?
      throw new Error "Required configuration 'port' is missing."

    @requestClient = request.defaults {
      jar:                 @jar
      followAllRedirects:  true
      json:                true
    }

    @app
      .use bodyParser()
      .use @router.routes()
      .use @router.allowedMethods()
      .listen @opts.port, cb

  _operate: (account, opts={}) ->
    @request {
      method:  'POST'
      url:     "/api/v1/applet/user/#{account.user}/accounts/#{account._id}/operate"
      body:    opts
    }


fetchRequiredInformation = (nw, ctx, next) ->
  unless ctx.request.body.userId?
    ctx.response.body = error: 'missing parameter userId'
    ctx.response.status = 400
    return

  startTime    = Date.now()

  try
    unless (appletId = nw.config 'appletId')?
      throw new Error "Applet id is missing in configuration."

    ctx.userId                 = ctx.request.body.userId
    {user, userApplet, applet} = await nw.request {
      method:            'GET'
      url:               "/api/v1/applet-api/#{appletId}/users/#{ctx.userId}"
      qs:
        accounts:        true
    }
    _.extend ctx, user: user, userApplet: userApplet, applet: applet

    ctx.accounts    = parseAccount nw, ctx.userApplet?.accounts ? []
    ctx.nodeswork   = nw
    ctx.components  = createComponents nw, ctx

    await next()

    ctx.body = {
      status:    'okay'
      duration:  Date.now() - startTime
    }

  catch e
    ctx.body = {
      status:   'error'
      message:  e.message
      duration:  Date.now() - startTime
    }
    ctx.response.status = 500


parseAccount = (nw, accounts) ->
  _.map accounts, (account) ->
    act = new nw.accountClazz[account.accountType]
    _.extend act, account

createComponents = (nw, ctx) ->
  _.object _.map nw.componentClazz, (cls) ->
    component = new cls user: ctx.user, userApplet: ctx.userApplet, applet: ctx.applet
    [
      Case.camel cls.name
      component
    ]


PROCESSING_URL_PATH = '/process'


module.exports = nodeswork = _.extend new Nodeswork, {
  Nodeswork: Nodeswork
}
