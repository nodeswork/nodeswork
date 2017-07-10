_                    = require 'underscore'


# Pre-define getter and setter to Function's propotype.
Function::getter ?= (prop, get) ->
  Object.defineProperty @prototype, prop, { get, configurable: yes }

Function::setter ?= (prop, set) ->
  Object.defineProperty @prototype, prop, { set, configurable: yes }


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
