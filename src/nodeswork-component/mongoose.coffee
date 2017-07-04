_                       = require 'underscore'
{ logger }              = require 'nodeswork-logger'
{
  validator
  NAMED }               = require 'nodeswork-utils'
winston                 = require 'winston'

{ NodesworkComponent }  = require './component'

# Provide mongoose local database access.
class Mongoose extends NodesworkComponent

  constructor: (ctx) ->
    super ctx

  # Intialize Mongoose component. After intialization, Mongoose::mongoose or
  #   instance.mongoose is set to mongoose object.
  #
  # @option options {String} logCollection='logs' specifies the collection under
  #   MongoDB.
  #
  # @throw {NodesworkError} error when nodeswork.config('db') is missing.
  @initialize: (options={}) ->
    {
      storeLog      = true
      logCollection = 'logs'
      logQueryPath  = '/logs'
    } = options

    @::mongoose          = require 'mongoose'
    @::mongoose.Promise  = global.Promise
    dbURI                = @::nodeswork.config('db')

    validator.isRequired dbURI, meta: {
      path: 'nodeswork.config.db'
    }

    await @::mongoose.connect dbURI
    logger.info 'Mongoose is connected.'

    @setupLogger logCollection, logQueryPath if storeLog

    logger.info 'Mongoose component is initialized.'
    return

  @setupLogger: (logCollection, logQueryPath) ->
    nwLogger         = require 'nodeswork-logger'
    {MongoDB}        = require 'winston-mongodb'
    db               = @::mongoose.connections[0].db
    nwLogger.transports.push nwLogger.transport winston.transports.MongoDB, {
      db:          db
      collection:  logCollection
    }
    Log              = nwLogger.registerMongooseModel {
      collections: logCollection
      mongoose:    @::mongoose
      modelName:   'Log'
    }
    logger           = nwLogger.logger

    @::nodeswork.view logQueryPath, NAMED 'queryLog', _.bind @logQueryHandler, @

  @logQueryHandler: (ctx, next) ->
    {Log}     = @::mongoose.models
    ctx.body  = await Log.find()


module.exports = {
  Mongoose
}
