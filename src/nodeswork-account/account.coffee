{Module}     = require 'nodeswork-utils'


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
    @nodeswork._operate @, opts


module.exports = {
  NodesworkAccount
}
