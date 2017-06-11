{NodesworkComponent} = require './component'
{logger}             = require 'nodeswork-logger'
{validator}          = require 'nodeswork-utils'
winston              = require 'winston'


# Provide mongoose local database access.
class Mongoose extends NodesworkComponent

  constructor: (ctx) ->


  # Intialize Mongoose component. After intialization, Mongoose::mongoose or
  #   instance.mongoose is set to mongoose object.
  #
  # @option options {String} logCollection='logs' specifies the collection under
  #   MongoDB.
  #
  # @throw {NodesworkError} error when nodeswork.config('db') is missing.
  @initialize: (options={}) ->
    {
      logCollection = 'logs'
    } = options

    logger.info 'Initialize mongoose component.'
    @::mongoose          = require 'mongoose'
    @::mongoose.Promise  = global.Promise
    dbURI                = @::nodeswork.config('db')

    validator.isRequired dbURI, details: {
      path: 'nodeswork.config.db'
    }

    await @::mongoose.connect dbURI
    logger.info 'Mongoose is connected.'

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
    logger.info 'Mongoose component is initialized.'
    return


module.exports = {
  Mongoose
}
