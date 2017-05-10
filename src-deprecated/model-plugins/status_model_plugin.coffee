# StatusSchemaPlugin is a Mongoose schema plugin which provides status fields.
co = require 'co'

module.exports = StatusModelPlugin = (schema, {
  choices = ['ACTIVE', 'INACTIVE'],
  defaultChoice = 'INACTIVE'
  index = no
} = {}) ->

  schema.add {
    status:
      type:     String
      enum:     choices
      default:  defaultChoice
      index:    index
  }

  schema.methods.updateStatus = (status) -> co =>
    @status = status
    yield @save()
