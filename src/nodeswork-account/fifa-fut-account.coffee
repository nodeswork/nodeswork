{ NodesworkAccount } = require '../accounts'

class FifaFutAccount extends NodesworkAccount

  getCredits: () ->
    @action method: 'getCredits'

  getPilesize: () ->
    @action method: 'getPilesize'

  getTradepile: () ->
    @action method: 'getTradepile'

  relist: () ->
    @action method: 'relist'

  getWatchlist: () ->
    @action method: 'getWatchlist'

  search: (opts={}) ->
    @action _.extend {}, opts, method: 'search'

  placeBid: ({tradeId, coins}) ->
    @action method: 'placeBid', tradeId: tradeId, coins: coins

  listItem: ({itemDataId, startingBid, buyNowPrice, duration}) ->
    @action {
      method: 'placeBid', itemDataId: itemDataId, startingBid: startingBid
      buyNowPrice: buyNowPrice, duration: duration
    }

  getStatus: ({tradeIds}) ->
    @action method: 'getStatus', tradeIds: tradeIds

  addToWatchlist: ({tradeId}) ->
    @action method: 'addToWatchlist', tradeId: tradeId

  removeFromTradepile: ({tradeId}) ->
    @action method: 'removeFromTradepile', tradeId: tradeId

  removeFromWatchlist: ({tradeId}) ->
    @action method: 'removeFromWatchlist', tradeId: tradeId

  sendToTradepile: ({itemDataId}) ->
    @action method: 'sendToTradepile', itemDataId: itemDataId

  sendToClub: ({itemDataId}) ->
    @action method: 'sendToClub', itemDataId: itemDataId

  quickSell: ({itemDataId}) ->
    @action method: 'quickSell', itemDataId: itemDataId


module.exports = {
  FifaFutAccount
}
