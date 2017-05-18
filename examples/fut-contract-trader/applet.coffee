nodeswork      = require '../../src'


# nodeswork
  # .use nodeswork.FifaFutAccount


nodeswork

  .config {
    server: 'http://localhost:3000'
    port:   28888
  }

  .process (ctx) ->
    account = ctx.accounts[0]
    console.log 'user', ctx.user
    console.log 'account', account
    # console.log await account.getCredits()

    # console.log await account.search {
      # cat: 'contract'
      # lev: 'gold'
      # type: 'development'
      # minb: 200
      # maxb: 300
    # }


# nodeswork.config 'env'
# nodeswork.config 'server'


nodeswork.start () ->
  console.log 'started.'
