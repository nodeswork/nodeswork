_                    = require 'underscore'


# Pre-define getter and setter to Function's propotype.
Function::getter ?= (prop, get) ->
  Object.defineProperty @prototype, prop, { get, configurable: yes }

Function::setter ?= (prop, set) ->
  Object.defineProperty @prototype, prop, { set, configurable: yes }


accounts             = require './nodeswork-account'
components           = require './nodeswork-component'
nodeswork            = require './nodeswork'


module.exports = _.extend(
  nodeswork
  accounts
  components
)
