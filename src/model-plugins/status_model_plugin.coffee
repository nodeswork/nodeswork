# StatusSchemaPlugin is a Mongoose schema plugin which provides status fields.

module.exports = StatusModelPlugin = (schema, {
  choices = ['ACTIVE', 'INACTIVE'],
  defaultChoice = 'INACTIVE'
  index = no
} = {}) ->

  schema.add {
    status:  type: String, enum: choices, default: defaultChoice
  }

  if index
    schema.path('status').index true
