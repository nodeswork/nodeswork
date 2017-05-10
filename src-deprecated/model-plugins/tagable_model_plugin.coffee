# TagableSchemaPlugin is a Mongoose schema plugin which provides tags and
# related indexes.

module.exports = TagableModelPlugin = (schema, options) ->

  schema.add {
    tags:  [String]
  }

  schema.path('tags').index(true)
