_                       = require 'underscore'
{ validator }           = require 'nodeswork-utils'

{ NodesworkComponent }  = require './component'


class Request extends NodesworkComponent

  constructor: (ctx) ->
    super ctx
    @logger = ctx.components.logger
    validator.isRequired @logger, details: {
      path: 'ctx.components.logger'
      hints: 'Ensure Logger component is imported before.'
    }

  get: (options) ->
    @request _.extend options, method: 'GET'

  post: (options) ->
    @request _.extend options, method: 'POST'

  request: (options) ->
    startTime  = Date.now()
    try
      res      = await @nodeswork.request options
      @logger.info 'Send request success.', {
        options: options
        duration: Date.now() - startTime
      }
      res
    catch e
      @logger.info 'Send request failed.', {
        options: options
        duration: Date.now() - startTime
      }
      throw e


module.exports = {
  Request
}
