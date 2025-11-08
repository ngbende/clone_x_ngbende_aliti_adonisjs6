import Follow from '#models/follow'
import Tweet from '#models/tweet'
import type { HttpContext } from '@adonisjs/core/http'

export default class FollowsController {
  public async toggleFollow({ auth, params, response }: HttpContext) {
    try {
      const followerId = auth.user!.id
      const followedId = Number(params.id)

      if (followerId === followedId) {
        return response.badRequest('Tu ne peux pas te suivre toi-même')
      }

      const follow = await Follow.query()
        .where('follower_id', followerId)
        .andWhere('followed_id', followedId)
        .first()

      if (follow) {
        await follow.delete()
        console.log('Unfollowed successfully')
        return response.ok({ status: 'unfollowed' })
      } else {
        await Follow.create({ followerId, followedId })
        console.log('Followed successfully')
        return response.ok({ status: 'followed' })
      }
    } catch (error) {
      console.error('Error toggling follow status:', error)
      return response.internalServerError('An error occurred while toggling follow status')
    }
  }

  // Récupérer tous les followers d'un utilisateur
  public async getFollowers({ params, response }: HttpContext) {
    const userId = Number(params.id)

    const followers = await Follow.query()
      .where('followed_id', userId)
      .preload('follower') // Assurez-vous que relation "follower" existe dans le model Follow
      .exec()

    const result = followers.map((f) => ({
      id: f.follower.id,
      nom: f.follower.nom,
      prenom: f.follower.prenom,
      photoProfil: f.follower.photoProfil,
    }))

    return response.ok(result)
  }

  // Récupérer tous les utilisateurs suivis (followings)
  public async getFollowings({ params, response }: HttpContext) {
    const userId = Number(params.id)

    const followings = await Follow.query()
      .where('follower_id', userId)
      .preload('followed') // Assurez-vous que relation "followed" existe dans le model Follow
      .exec()

    const result = followings.map((f) => ({
      id: f.followed.id,
      nom: f.followed.nom,
      prenom: f.followed.prenom,
      photoProfil: f.followed.photoProfil,
    }))

    return response.ok(result)
  }

  public async tweetsFollowing({ auth, view, response }: HttpContext) {
    try {
      const userId = auth.user!.id

      // Récupérer les IDs des utilisateurs que le user suit
      const followings = await Follow.query().where('follower_id', userId).preload('followed')
      const followingIds = followings.map((f) => f.followed.id)

      // Récupérer les tweets de ces utilisateurs
         const tweets = await Tweet.query()
      .whereIn('user_id', followingIds)
      .preload('user') // pour les infos de l'auteur
      .preload('medias') // AJOUT: charger les médias
      .preload('likes') // AJOUT: charger les likes
      .preload('retweets') // AJOUT: charger les retweets
      .preload('hashtags') // AJOUT: charger les hashtags
      .preload('replies') // AJOUT: charger les réponses (optionnel)
      .orderBy('created_at', 'desc')
      .exec()

    // ✅ AJOUT: Transformation des hashtags pour chaque tweet
    tweets.forEach((tweet) => {
      if (tweet.hashtags && tweet.hashtags.length > 0) {
        let content = tweet.content
        tweet.hashtags.forEach((h) => {
          const regex = new RegExp(`#${h.texteHashtag}`, 'gi')
          content = content.replace(
            regex,
            `<a href="/hashtag/${h.texteHashtag}" class="text-blue-400 hover:underline">#${h.texteHashtag}</a>`
          )
        })
        tweet.contentClean = content
      } else {
        tweet.contentClean = tweet.content
      }
    })

      // Récupérer des suggestions (par ex. utilisateurs non suivis)
      const followedIds = followingIds.concat(userId) // exclure déjà suivis + soi-même
      const suggestionsFollow = await Follow.query()
        .whereNotIn('followed_id', followedIds)
        .preload('followed')
        .exec()

      const suggestions = suggestionsFollow.map((f) => ({
        id: f.followed.id,
        nom: f.followed.nom,
        prenom: f.followed.prenom,
        photoProfil: f.followed.photoProfil,
      }))
      console.log('IDs suivis:', followingIds)
      console.log('Tweets récupérés:', tweets.length)

      return view.render('pages/following', { tweets, suggestions })
    } catch (error) {
      console.error('Erreur récupération tweets followings:', error)
      return response.internalServerError('Impossible de récupérer les tweets des followings')
    }
  }
}
