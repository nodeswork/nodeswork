_                      = require 'underscore'
{ logger }             = require 'nodeswork-logger'

{ NodesworkComponent } = require '../components/component'


class Logger extends NodesworkComponent

  constructor: (ctx) ->
    super ctx
    @ctx = ctx

  debug: (message, meta={}) ->
    logger.debug   message, _.extend {}, meta, @extractor @ctx

  verbose: (message, meta={}) ->
    logger.verbose message, _.extend {}, meta, @extractor @ctx

  info: (message, meta={}) ->
    logger.info    message, _.extend {}, meta, @extractor @ctx

  warn: (message, meta={}) ->
    logger.warn    message, _.extend {}, meta, @extractor @ctx

  error: (message, meta={}) ->
    logger.error   message, _.extend {}, meta, @extractor @ctx

  @initialize: (options) ->
    {
      extractor = (ctx) -> key: ctx.logKey
    } = options
    @::extractor = extractor
    logger.info 'Component Logger finished first round of initialization.'

  @initialized: (options) ->
    { logger } = require 'nodeswork-logger'
    logger.info 'Component Logger is fully initialized.'


module.exports = {
  Logger
}
