
# Base Nodeswork Component class.
#
# Nodeswork Component will be automatically created for each process request.
#
# @note nodeswork instance will be attached as a prototype of the component
#   class, so it will be accessible as this.nodeswork.
#
class NodesworkComponent

  # Ctx will be passed in as parameter, deconstruct what you need within
  # the constructor.
  #
  # @param [KoaContext] ctx context for the current request.
  constructor: (ctx) ->

  # Initialize the component.  It will be called when starting the nodeswork
  #   instance.
  #
  # @return [Promise<void>]
  @initialize: (options) ->

  # Triggered when serice starts to run.
  #
  # @return [Promise<void>]
  @initialized: (options) ->


module.exports = {
  NodesworkComponent
}
