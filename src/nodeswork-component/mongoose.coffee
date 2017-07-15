_                       = require 'underscore'
{ logger }              = require '@nodeswork/logger'
{
  validator
  NAMED }               = require '@nodeswork/utils'
winston                 = require 'winston'

{ NodesworkComponent }  = require '../components/component'


registerMongooseModel = (options) ->
  {
    mongoose
    modelName
    collections = 'logs'
  } = options
  LogSchema = mongoose.Schema {
    timestamp:  Date
    level:      String
    message:    String
    meta:       mongoose.Schema.Types.Mixed
    label:      String
  }, collections: collections

  LogSchema.index {
    'meta.key': 1
  }

  LogSchema.statics.searchLog = (query={}, options={}) ->
    {limit, skip} = options
    res = @find(query).sort(timestamp: -1)
    res = res.skip skip if skip?
    res = res.limit limit if limit?
    res

  mongoose.model modelName, LogSchema


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
    nwLogger         = require '@nodeswork/logger'
    { MongoDB }      = require 'winston-mongodb'
    db               = @::mongoose.connections[0].db
    nwLogger.transports.push nwLogger.transport winston.transports.MongoDB, {
      db:          db
      collection:  logCollection
    }
    Log              = registerMongooseModel {
      collections: logCollection
      mongoose:    @::mongoose
      modelName:   'Log'
    }

    @::nodeswork.view logQueryPath, NAMED 'queryLog', _.bind @logQueryHandler, @

  @logQueryHandler: (ctx, next) ->
    { Log }   = @::mongoose.models
    query =
      if ctx.request.query.key? then "meta.key": ctx.request.query.key
      else {}
    ctx.body  = await Log.find query


module.exports = {
  Mongoose
}
