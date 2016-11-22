
mongoose  = require 'mongoose'

nodeswork = require '../index'


nw = new nodeswork.Nodeswork {
  moduleName: 'simple_server'
}


UserSchema = mongoose.Schema {
  username: String
}, collection: 'users'

User = mongoose.model 'User', UserSchema

nw.model User, {
  apiExposed:
    methods: ['get', 'create', 'update', 'delete']
    urlName: 'User'
    path: '/users/:userId'
    params:
      userId: '@_id'
}

nw.start()
