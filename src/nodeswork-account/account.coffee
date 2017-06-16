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
  operate: (opts) ->
    logger = @ctx?.components?.logger
    validator.isRequired logger, meta: {
      path: 'ctx.components.logger'
    }
    data = {
      account:
        _id:              @_id
        name:             @name
        constructor:      @constructor.name
        accountCategory:
          _id:            @accountCategory._id
          name:           @accountCategory.name
      operate:            opts
    }
    try
      await @nodeswork._operate @, opts
      data.status = 'success'
      logger.info 'Operate on account successfully.', data
    catch e
      data.status = 'error'
      logger.error 'Operate on account failed.', data
      throw e


module.exports = {
  NodesworkAccount
}
