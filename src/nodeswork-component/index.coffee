_ = require 'underscore'

# Base Nodeswork Component class.
#
exports.NodesworkComponent = class NodesworkComponent

  # Ctx will be passed in as parameter, deconstruct what you need within
  # constructor.
  constructor: (ctx) ->

  # Called within nodeswork.start().
  @initialize: () ->


exports.Messager = class Messager extends NodesworkComponent

  constructor: (ctx) ->
    super ctx
    {@user, @applet} = ctx

  sendMessage: (opts) ->
    if _.isString opts then opts = message: opts

    {message} = opts

    url = "/api/v1/applet-api/#{@applet._id}/users/#{@user._id}/messages"

    @nodeswork.request {
      method:            'POST'
      url:               url
      body:
        message:         message
    }
