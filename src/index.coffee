_                    = require 'underscore'

accounts             = require './nodeswork-account'
components           = require './nodeswork-component'
nodeswork            = require './nodeswork'

module.exports = _.extend(
  nodeswork
  accounts
  components
)
