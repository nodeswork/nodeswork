_                    = require 'underscore'

{
  NodesworkAccount
  FifaFutAccount
}                    = require './nodeswork-account'
{
  NodesworkComponent
  Messager
}                    = require './nodeswork-component'

nodeswork            = require './nodeswork'

module.exports = _.extend nodeswork, {
  NodesworkAccount:    NodesworkAccount
  FifaFutAccount:      FifaFutAccount
  NodesworkComponent:  NodesworkComponent
  Messager:            Messager
}
