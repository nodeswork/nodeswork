# DescriptiveSchemaPlugin is a Mongoose schema plugin which provides description
# field.

module.exports = DescriptiveModelPlugin = (schema) ->

  schema.add {
    description:     String
  }
