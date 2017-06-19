_                       = require 'underscore'

{ NodesworkComponent }  = require './component'


class Request extends NodesworkComponent

  constructor: (ctx) ->
    super ctx
    @logger = @depends 'logger'

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
