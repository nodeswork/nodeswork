
{NodesworkAccount} = require './account'


class TwitterAccount extends NodesworkAccount

  # Get home timeline of the user.
  #
  # @option options {Number} count specifies the number of records to retrieve.
  #   Must be less than or equal to 200. Defaults to 20. The value of count is
  #   best thought of as a limit to the number of tweets to return because
  #   suspended or deleted content is removed after the count has been applied.
  #
  # @option options {ID} since_id Returns results with an ID greater than (that
  #   is, more recent than) the specified ID. There are limits to the number of
  #   Tweets which can be accessed through the API. If the limit of Tweets has
  #   occured since the since_id, the since_id will be forced to the oldest ID
  #   available.)
  #
  # @option options {ID} max_id Returns results with an ID less than (that is,
  #   older than) or equal to the specified ID.)
  #
  # @option options {Boolean} trim_user When set to either true , t or 1 , each
  #   Tweet returned in a timeline will include a user object including only the
  #   status authors numerical ID. Omit this parameter to receive the complete
  #   user object.
  #
  # @option options {Boolean} exclude_replies This parameter will prevent
  #   replies from appearing in the returned timeline. Using exclude_replies
  #   with the count parameter will mean you will receive up-to count Tweets —
  #   this is because the count parameter retrieves that many Tweets before
  #   filtering out retweets and replies.
  #
  # @option options {Boolean} include_entities The entities node will not be
  #   included when set to false.
  getHomeTimelineStatues: (options) ->
    @operate {
      method:   'GET'
      path:     'statuses/home_timeline'
      options:  options
    }

  # Updates the authenticating user’s current status, also known as Tweeting.
  #
  # @option options {String} status required, The text of the status update,
  #   typically up to 140 characters.
  # @option options {ID} in_reply_to_status_id The ID of an existing status that
  #   the update is in reply to.
  tweet: (options) ->
    @operate {
      method:   'POST'
      path:     'statuses/update'
      options:  options
    }


module.exports = {
  TwitterAccount
}
