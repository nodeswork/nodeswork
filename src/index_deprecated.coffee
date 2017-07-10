_                    = require 'underscore'

accounts             = require './accounts'
oldAccounts          = require './nodeswork-account'
components           = require './components'
oldComponents        = require './nodeswork-component'

{ Nodeswork }        = require './nodeswork'

nodeswork = new Nodeswork()

module.exports = _.extend(
  nodeswork
  accounts
  oldAccounts
  components
  oldComponents
)
