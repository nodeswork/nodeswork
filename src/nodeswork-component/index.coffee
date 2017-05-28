_ = require 'underscore'

exports.NodesworkComponent = class NodesworkComponent

  constructor: ({@user, @userApplet, @applet}) ->


exports.Messager = class Messager extends NodesworkComponent

  sendMessage: (opts) ->
    if _.isString opts then opts = message: opts

    {message} = opts

    url = "/api/v1/applet-api/#{@applet._id}/users/#{@user._id}/messages"

    @nodeswork.request {
      method:            'POST'
      url:               url
      headers:
        'applet-token':  @nodeswork.config 'appletToken'
      body:
        message:         message
    }
