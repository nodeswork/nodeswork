_                  = require 'underscore'
Koa                = require 'koa'
KoaRouter          = require 'koa-router'
bodyParser         = require 'koa-bodyparser'
request            = require 'request-promise'

{
  NodesworkAccount,
  FifaFutAccount,
}                  = require './nodeswork-account'


PROCESSING_URL_PATH = '/process'


DEFAULT_REQUEST = request.defaults {
  jar:                 request.jar()
  followAllRedirects:  true
  json:                true
}

DEFAULT_OPTS = {
  nodesworkServerUrl:  'http://localhost:3000'
}


class Nodeswork

  constructor: (opts={}) ->
    @opts          = _.extend {}, DEFAULT_OPTS, opts
    @middlewares   = []
    @accountClazz  = {}
    @app           = new Koa
    @router        = new KoaRouter

    @router
      .use PROCESSING_URL_PATH, _.bind @_fetchRequiredInformation, @

  use: (args...) ->
    args.forEach (arg) => switch
      when arg.prototype instanceof NodesworkAccount
        @accountClazz[arg.name]  = arg
        arg::nodeswork           = @
      when typeof arg == 'function'
        @middlewares.push arg
        @router.post PROCESSING_URL_PATH, arg
      else throw new TypeError 'Unkown arguments.'

  start: () ->
    @app
      .use bodyParser()
      .use @router.routes()
      .use @router.allowedMethods()

    @app.listen 5000, ->
      console.log 'service is started.'


  _fetchRequiredInformation: (ctx, next) ->
    unless ctx.request.body.userId?
      ctx.response.body = error: 'missing parameter userId'
      ctx.response.status = 400
      return

    {user, configs} = await DEFAULT_REQUEST.get {
      url:   "#{@opts.nodesworkServerUrl}/api/v1/applet/user/#{ctx.request.body.userId}"
    }

    [ctx.user, ctx.configs] = [user, configs]


    ctx.accounts = @_parseAccount await DEFAULT_REQUEST.get {
      url:   "#{@opts.nodesworkServerUrl}/api/v1/applet/user/#{ctx.request.body.userId}/accounts"
    }

    await next()

  _parseAccount: (accounts) ->
    _.map accounts, (account) =>
      accountClass   = @accountClazz[account.accountType]
      parsedAccount  = _.extend new accountClass(), account

  _operate: (account, opts={}) ->
    DEFAULT_REQUEST.post {
      url:   "#{@opts.nodesworkServerUrl}/api/v1/applet/user/#{account.user}/accounts/#{account._id}/operate"
      body:  opts
    }


module.exports = nodeswork = new Nodeswork

nodeswork.Nodeswork = Nodeswork

nodeswork.NodesworkAccount = NodesworkAccount
nodeswork.FifaFutAccount   = FifaFutAccount
