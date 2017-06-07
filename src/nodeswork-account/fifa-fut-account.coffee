{NodesworkAccount} = require './account'

class FifaFutAccount extends NodesworkAccount

  getCredits: () ->
    @operate method: 'getCredits'

  getPilesize: () ->
    @operate method: 'getPilesize'

  getTradepile: () ->
    @operate method: 'getTradepile'

  relist: () ->
    @operate method: 'relist'

  getWatchlist: () ->
    @operate method: 'getWatchlist'

  search: (opts={}) ->
    @operate _.extend {}, opts, method: 'search'

  placeBid: ({tradeId, coins}) ->
    @operate method: 'placeBid', tradeId: tradeId, coins: coins

  listItem: ({itemDataId, startingBid, buyNowPrice, duration}) ->
    @operate {
      method: 'placeBid', itemDataId: itemDataId, startingBid: startingBid
      buyNowPrice: buyNowPrice, duration: duration
    }

  getStatus: ({tradeIds}) ->
    @operate method: 'getStatus', tradeIds: tradeIds

  addToWatchlist: ({tradeId}) ->
    @operate method: 'addToWatchlist', tradeId: tradeId

  removeFromTradepile: ({tradeId}) ->
    @operate method: 'removeFromTradepile', tradeId: tradeId

  removeFromWatchlist: ({tradeId}) ->
    @operate method: 'removeFromWatchlist', tradeId: tradeId

  sendToTradepile: ({itemDataId}) ->
    @operate method: 'sendToTradepile', itemDataId: itemDataId

  sendToClub: ({itemDataId}) ->
    @operate method: 'sendToClub', itemDataId: itemDataId

  quickSell: ({itemDataId}) ->
    @operate method: 'quickSell', itemDataId: itemDataId


module.exports = {
  FifaFutAccount
}
