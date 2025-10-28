import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import User from '#models/user'
import Retweet from '#models/retweet'

export default class ProfilesController {
  /**
   * Profil de l'utilisateur connecté
   */
  public async myProfile({ auth, view }: HttpContext) {
    const user = auth.user
    if (!user) {
      return view.render('pages/auth/login', {
        error: 'Connectez-vous pour voir votre profil.',
      })
    }

    // Tweets écrits par le user
    const tweets = await Tweet.query()
      .where('user_id', user.id)
      .whereNull('parent_id')
      .preload('user')
      .preload('likes')
      .preload('medias')
      .preload('retweets')
      .preload('replies')

    // Tweets que le user a retweetés
    const retweetRecords = await Retweet.query()
      .where('user_id', user.id)
      .preload('tweet', (query) => {
        query
          .preload('user')
          .preload('likes')
          .preload('medias')
          .preload('retweets')
          .preload('replies')
      })

    // On transforme les retweets en vrais tweets
    const retweetedTweets = retweetRecords.map((rt) => {
      const t = rt.tweet!
      t.$extras.isRetweet = true
      t.$extras.retweetedBy = user.nom
      return t
    })

    //Fusion + tri par date
    const allTweets = [...tweets, ...retweetedTweets].sort(
      (a, b) => b.createdAt.toJSDate().getTime() - a.createdAt.toJSDate().getTime()
    )

    return view.render('pages/profile', { user, tweets: allTweets })
  }

  /**
   * Profil d'un autre utilisateur
   */
  public async showUserProfile({ params, view }: HttpContext) {
    const user = await User.findOrFail(params.id)

    // Tweets écrits par cet utilisateur
    const tweets = await Tweet.query()
      .where('user_id', user.id)
      .whereNull('parent_id')
      .preload('user')
      .preload('likes')
      .preload('medias')
      .preload('retweets')
      .preload('replies')

    // Tweets qu'il a retweetés
    const retweetRecords = await Retweet.query()
      .where('user_id', user.id)
      .preload('tweet', (query) => {
        query
          .preload('user')
          .preload('likes')
          .preload('medias')
          .preload('retweets')
          .preload('replies')
      })

    // Transformation en vrais tweets
    const retweetedTweets = retweetRecords.map((rt) => {
      const t = rt.tweet!
      t.$extras.isRetweet = true
      t.$extras.retweetedBy = user.nom
      return t
    })

    //Fusion + tri
    const allTweets = [...tweets, ...retweetedTweets].sort(
      (a, b) => b.createdAt.toJSDate().getTime() - a.createdAt.toJSDate().getTime()
    )

    return view.render('pages/profile', { user, tweets: allTweets })
  }

  public async repliesPartial({ view, params }: HttpContext) {
    const tweet = await Tweet.query()
      .where('id', params.id)
      .preload('user')
      .preload('medias')
      .preload('replies', (q) => q.preload('user').preload('medias'))
      .firstOrFail()

    return view.render('views/partials/reply', { tweet })
  }
}
