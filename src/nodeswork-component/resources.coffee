_                       = require 'underscore'
Case                    = require 'case'
{ URL }                 = require 'url'
# deepcopy                = require 'deepcopy'

{ NodesworkComponent }  = require '../components/component'


# Pre-define getter and setter to Function's propotype.
Function::getter ?= (prop, get) ->
  Object.defineProperty @prototype, prop, { get, configurable: yes }

Function::setter ?= (prop, set) ->
  Object.defineProperty @prototype, prop, { set, configurable: yes }



class Resource

  constructor: (doc) ->
    _.extend @, doc

  @initialize: (@options) ->
    @options.actions = _.defaults @options.actions, {
      create:
        method:  'POST'
        isArray: false
      query:
        method:  'GET'
        isArray: true
      get:
        method:  'GET'
        isArray: false
      save:
        method:  'POST'
        isArray: false
      delete:
        method:  'DELETE'
        isArray: false
    }
    for action in  _.keys @options.actions
      options   = @getOption action
      do (options) =>
        @[action] = (params) ->
          opt = deepcopy options
          _.extend opt.params, params
          requestOpts = {
            url:      transformUrl opt.url, opt.params, true
            method:   opt.method
            headers:  opt.headers
          }
          res = await @ctx.components.request.request requestOpts
          transformResponse @, res, opt

        @::["$#{action}"] = () ->

  @getOption: (action) ->
    url:      @options[action]?.url ? @options.url
    method:   @options[action]?.method ? 'GET'
    params:   @options[action]?.params ? @options.params ? {}
    isArray:  @options[action]?.isArray ? false
    headers:  _.extend {}, @options[action]?.headers, @options.headers


class Resources extends NodesworkComponent

  constructor: (ctx) ->
    super ctx
    @request = @depends 'request'
    @cache   = {}

  # Define a new resource.
  #
  # @param {String} name
  # @option options {String} url
  # @option options {Object} params
  # @option options {Object} actions
  @define: (name, options) ->
    @getter name, () ->
      unless @cache[name]
        class NResource extends Resource
        NResource.initialize options
        @cache[name] = NResource

      class SResource extends @cache[name]
      Object.defineProperty SResource, 'name', get: () -> name
      Object.defineProperty SResource, 'ctx', get: () => @ctx
      SResource


transformUrl = (url, params, isGet=false) ->
  usedNames = []
  fetchFromParams = (match, name) ->
    usedNames.push name
    params[name] ? ''
  u = new URL url
  u.pathname = u.pathname.replace /:(\w+)/g, fetchFromParams
  if isGet
    searchParams = u.searchParams
    for name, val of params
      searchParams.set name, val unless name in usedNames
  u.href


transformResponse = (cls, res, options) ->
  if options.isArray
    _.map res, (r) -> new cls r
  else
    new cls res


module.exports = {
  Resources
}
