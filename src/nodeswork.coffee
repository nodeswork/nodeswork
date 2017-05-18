_                   = require 'underscore'
Koa                 = require 'koa'
KoaRouter           = require 'koa-router'
bodyParser          = require 'koa-bodyparser'
request             = require 'request-promise'

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
    @opts          = {}
    @config @_opts
    @app           = new Koa
    @router        = new KoaRouter
    @processes     = []
    @accountClazz  = {}

    @router
      .post PROCESSING_URL_PATH, _.bind fetchRequiredInformation, null, @


  # Either to config current nodeswork instance, or retrieve a config value.
  #
  # @param opts [Object] config current nodeswork instance.
  # @param opts [String] retrieve the config value for this key.
  config: (opts) ->
    if _.isString opts then return @opts[opts]

    @_opts  = opts
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

  process: (middlewares...) ->
    Array::push.apply @processes, middlewares
    @router.post.apply @router, [PROCESSING_URL_PATH].concat middlewares
    @

  view: (path, middlewares...) ->

  request: (opts) ->
    @requestClient _.extend {}, opts, {
      url: "#{@opts.server}#{opts.url}"
    }

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

  ctx.userId                = ctx.request.body.userId
  {user, configs, accounts} = await nw.request {
    method:      'GET'
    url:         "/api/v1/applet/user/#{ctx.userId}"
    qs:
      accounts:  true
  }
  [ctx.user, ctx.configs]  = [user, configs]
  ctx.accounts             = parseAccount nw, accounts

  await next()


parseAccount = (nw, accounts) ->
  _.map accounts, (account) ->
    act = new nw.accountClazz[account.accountType]
    _.extend act, account


PROCESSING_URL_PATH = '/process'


module.exports = nodeswork = _.extend new Nodeswork, {
  Nodeswork: Nodeswork
}
