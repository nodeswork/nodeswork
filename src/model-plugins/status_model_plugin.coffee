# StatusSchemaPlugin is a Mongoose schema plugin which provides status fields.

module.exports = StatusModelPlugin = (schema, {
  choices = ['active', 'inactive'],
  defaultChoice = 'inactive'
  index = no
} = {}) ->

  schema.add {
    status:  type: String, enum: choices, default: defaultChoice
  }

  if index
    schema.path('status').index true
