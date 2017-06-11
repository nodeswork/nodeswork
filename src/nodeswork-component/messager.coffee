_                        = require 'underscore'
{ validator }            = require 'nodeswork-utils'

{ NodesworkComponent }   = require './component'
{ API_PREFIX }           = require '../constants'

# Messager is the component to send message to the current user.
class Messager extends NodesworkComponent

  constructor: (ctx) ->
    super ctx
    {@user, @applet} = ctx
    validator.isRequired @user, details: path: 'ctx.user'
    validator.isRequired @applet, details: path: 'ctx.applet'

  # Send message to user's message inbox.
  #
  # @option opts {String} message the message to send.
  # @return {Promise<Message>}
  sendMessage: (opts) ->
    if _.isString opts then opts = message: opts

    {message} = opts

    url = "#{API_PREFIX}/applet-api/#{@applet._id}/users/#{@user._id}/messages"

    @nodeswork.request {
      method:            'POST'
      url:               url
      body:
        message:         message
    }


module.exports = { Messager }
