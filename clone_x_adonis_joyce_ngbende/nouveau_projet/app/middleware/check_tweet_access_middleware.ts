import Block from '#models/block'
import Follow from '#models/follow'
import Tweet from '#models/tweet'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class CheckTweetAccessMiddleware {
  public async handle({ auth, params, response, view }: HttpContext, next: () => Promise<void>) {
    const currentUser = auth.user
    const tweetId = params.id

    if (!tweetId || !currentUser) {
      return await next()
    }

    try {
      // Récupérer le tweet avec son propriétaire
      const tweet = await Tweet.query()
        .where('id', tweetId)
        .preload('user')
        .firstOrFail()

      // Vérifier si l'utilisateur est bloqué par le propriétaire du tweet
      const isBlocked = await Block.query()
        .where('blocker_id', tweet.user.id)
        .andWhere('blocked_id', currentUser.id)
        .first()

      if (isBlocked) {
        const html = await view.render('pages/errors/not_founds', {
          message: 'Utilisateur introuvable ou inaccessible',
        })
        return response.status(404).send(html)
      }

      // Vérifier si le compte est privé
      if (tweet.user.isPrivate && tweet.user.id !== currentUser.id) {
        const isFollowing = await Follow.query()
          .where('follower_id', currentUser.id)
          .andWhere('followed_id', tweet.user.id)
          .first()

        if (!isFollowing) {
          const html = await view.render('pages/privateAccount', {
            cible: tweet.user,
            followStatus: 'none',
            canRequestFollow: true,
          })
          return response.send(html)
        }
      }

      await next()
    } catch (error) {
      // Si le tweet n'existe pas, laisser le contrôleur gérer l'erreur
      await next()
    }
  }
}