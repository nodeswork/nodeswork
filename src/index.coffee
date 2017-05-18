_                  = require 'underscore'

{
  NodesworkAccount,
  FifaFutAccount,
}                  = require './nodeswork-account'

nodeswork          = require './nodeswork'

module.exports = _.extend nodeswork, {
  NodesworkAccount: NodesworkAccount
  FifaFutAccount:   FifaFutAccount
}
