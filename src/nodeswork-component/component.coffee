Case               = require 'case'
{ NodesworkError
  validator }      = require 'nodeswork-utils'

# Base Nodeswork Component class.
#
# Nodeswork Component will be automatically created for each process request.
#
# @note nodeswork instance will be attached as a prototype of the component
#   class, so it will be accessible as this.nodeswork.
#
class NodesworkComponent

  # Ctx will be passed in as parameter, deconstruct what you need within
  # the constructor.
  #
  # @param [KoaContext] ctx context for the current request.
  constructor: (@ctx) ->

  depends: (name) ->
    res = @ctx.components[name]
    validator.isRequired res, meta: {
      path: "ctx.components.#{name}"
      hints: "Ensure component #{name} is imported."
    }
    res

  # Initialize the component.  It will be called when starting the nodeswork
  #   instance.
  #
  # @return [Promise<void>]
  @initialize: (options) ->

  # Triggered when serice starts to run.
  #
  # @return [Promise<void>]
  @initialized: (options) ->


class NodesworkComponents

  constructor: (@ctx) ->
    @cache = {}

  # Register component class.
  @register: (nodeswork, cls, options={}, overwrite=false) ->
    @_setup()

    cls::nodeswork = nodeswork
    for [ c, o ], i in @clazz
      if cls.name == c.name
        unless overwrite
          throw new NodesworkError(
            'Component has been registered before, set overwrite=true
            to overwrite it'
            name: c.name
          )
        @clazz[i] = [ cls, options ]
        return

    @clazz.push [ cls, options ]
    return

  @initialize: () ->
    for [ cls, options ] in @clazz
      await cls.initialize options

  @initialized: () ->
    for [ cls, options ] in @clazz
      await cls.initialized options
    for [ cls, options ] in @clazz
      name = Case.camel cls.name
      do (cls, name) =>
        @getter name, () ->
          unless @cache[name]?
            @cache[name] = new cls @ctx
          @cache[name]

  @_setup: () ->
    unless 'clazz' in Object.getOwnPropertyNames @
      @clazz = []


module.exports = {
  NodesworkComponent
  NodesworkComponents
}
