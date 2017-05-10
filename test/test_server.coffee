nodeswork      = require '../src'

class FifaFutAccount extends nodeswork.NodesworkAccount

  getCredits: () ->
    @operate method: 'getCredits'


nodeswork
  .use FifaFutAccount


nodeswork

  .use (ctx) ->
    # console.log 'body', ctx.request.body
    # console.log 'user', ctx.user      # user
    # console.log 'accounts', ctx.accounts  # granted accounts
    # console.log 'configs', ctx.configs   # configs
    account = ctx.accounts[0]
    console.log 'account', account
    console.log await account.getCredits()


nodeswork.start()
