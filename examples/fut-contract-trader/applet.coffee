nodeswork      = require '../src'


nodeswork
  .use nodeswork.FifaFutAccount


nodeswork

  .use (ctx) ->
    account = ctx.accounts[0]
    console.log 'account', account
    console.log await account.getCredits()


nodeswork.start()
