import User from '#models/user'
import Follow from '#models/follow'

export default class SuggestionService {
  public static async getSuggestions(authUserId: number) {
    const suggestions = await User.query().whereNot('id', authUserId)

    const suggestionsWithFollowState = await Promise.all(
      suggestions.map(async (user) => {
        const existingFollow = await Follow.query()
          .where('follower_id', authUserId)
          .andWhere('followed_id', user.id)
          .first()

        const followStatus = existingFollow ? 'followed' : 'none'

        return {
          ...user.toJSON(),
          followStatus: followStatus,
        }
      })
    )

    return suggestionsWithFollowState
  }
}