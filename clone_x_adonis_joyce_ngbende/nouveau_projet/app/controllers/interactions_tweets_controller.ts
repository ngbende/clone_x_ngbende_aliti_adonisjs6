import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import Like from '#models/like'
import Retweet from '#models/retweet'

export default class InteractionsTweetsController {
  public async toggleLike({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) return response.unauthorized('Utilisateur non authentifié')

      const tweetId = params.id
      const tweet = await Tweet.find(tweetId)
      if (!tweet) return response.notFound('Tweet introuvable')

      // Vérifier si le like existe déjà
     const existingLike = await Like.query()
        .where('userId', user.id)        // camelCase
        .andWhere('tweetId', tweetId)    // camelCase
        .first()

      if (existingLike) {
        // Retirer le like (unlike)
        await existingLike.delete()
        console.log('Like supprimé avec succès')
        return response.json({ success: true, action: 'unliked' })
      } else {
        // Créer le like
        await Like.create({ userId: user.id, tweetId: tweetId })
        console.log('Like créé avec succès')
        return response.json({ success: true, action: 'liked' })
      }
    } catch (error) {
      console.error('Erreur toggleLike:', error)
      return response.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors du like/unlike',
      })
    }
  }

  // Toggle retweet
  public async toggleRetweet({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) return response.unauthorized('Utilisateur non authentifié')

      const tweetId = params.id
      const tweet = await Tweet.find(tweetId)
      if (!tweet) return response.notFound('Tweet introuvable')

      // Vérifier si l'utilisateur a déjà retweeté
      const existingRetweet = await Retweet.query()
        .where('userId', user.id)
        .andWhere('tweetId', tweetId)
        .first()

      if (existingRetweet) {
        await existingRetweet.delete()
        console.log('Retweet supprimé avec succès')
        return response.json({ success: true, action: 'unretweeted' })
      } else {
        await Retweet.create({ userId: user.id, tweetId: tweetId })
        console.log('Retweet créé avec succès')
        return response.json({ success: true, action: 'retweeted' })
      }
    } catch (error) {
      console.error('Erreur toggleRetweet:', error)
      return response.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors du retweet/unretweet',
      })
    }
  }
}
