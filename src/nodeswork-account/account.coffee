{ validator
  Module }     = require 'nodeswork-utils'


# Base Nodeswork Account class.
#
# @note nodeswork instance will be attached as a prototype of the component
#   class, so it will be accessible as this.nodeswork.
class NodesworkAccount extends Module

  # Operate on the current account
  #
  # @param {Object} opts spcifies all the options pass to the remote.
  # @option opts {String} method specifies the detail method.
  #
  # @throw {NodesworkError} error
  #
  # @return {Promise<Result>}
  operate: (opts={}) ->
    { action } = opts
    request    = @component 'request'
    execution  = @ctx.execution

    validator.isRequired execution?._id, meta: {
      path: 'ctx.execution'
    }
    validator.isRequired action, meta: {
      path: 'options.action'
    }

    await request.post {
      url:  "/api/v1/executions/#{execution._id}/accounts/#{@_id}/#{action}"
      body: opts
    }

  component: (name, required=true) ->
    cmpt = @ctx.components[name]
    validator.isRequired cmpt, meta: {
      path: "ctx.components.#{name}"
    } if required
    cmpt


module.exports = {
  NodesworkAccount
}
