_                        = require 'underscore'
{ validator }            = require 'nodeswork-utils'

{ NodesworkComponent }   = require '../components/component'
{ API_PREFIX }           = require '../constants'

# Messager is the component to send message to the current user.
class Messager extends NodesworkComponent

  constructor: (ctx) ->
    super ctx
    {@user, @applet} = ctx
    @request = @depends 'request'

  # Send message to user's message inbox.
  #
  # @option opts {String} message the message to send.
  # @return {Promise<Message>}
  sendMessage: (opts) ->
    validator.isRequired @user, meta: path: 'ctx.user'
    validator.isRequired @applet, meta: path: 'ctx.applet'

    if _.isString opts then opts = message: opts

    {message} = opts

    url = "#{API_PREFIX}/applet-api/#{@applet._id}/users/#{@user._id}/messages"

    @request.post {
      url:               url
      body:
        message:         message
    }


module.exports = { Messager }
