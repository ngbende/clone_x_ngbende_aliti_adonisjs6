import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import User from '#models/user'
import Retweet from '#models/retweet'
import Follow from '#models/follow'
import Block from '#models/block'

export default class ProfilesController {
  /**
   * Profil de l'utilisateur connecté
   */
  public async myProfile({ auth, view }: HttpContext) {
    const user = await User.query()
      .where('id', auth.user!.id)
      .preload('followers')
      .preload('following')
      .firstOrFail()

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

    return view.render('pages/profile', { user, tweets: allTweets, isBlocked: false })
  }

  /**
   * Profil d'un autre utilisateur
   */
  public async showUserProfile({ params, view, auth }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .preload('followers')
      .preload('following')
      .firstOrFail()

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
    // Vérifier si l'utilisateur connecté a bloqué ce profil
    const isBlocked = await user.isBlockedBy(auth.user!.id)
    // Dans showUserProfile
    const blocked = await Block.query()
      .where('blocker_id', user.id) // le profil que je consulte
      .andWhere('blocked_id', auth.user!.id) // moi
      .first()

    if (blocked) {
      return view.render('pages/profile', { user, tweets: [], isBlocked: true })
    }

    return view.render('pages/profile', { user, tweets: allTweets, isBlocked })
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

  public async showFollows({ params, view }: HttpContext) {
    const { username, type } = params

    const user = await User.query()
      .where('nom', username) //  ici
      .preload('followers')
      .preload('following')
      .firstOrFail()

    let list = []

    if (type === 'followers') {
      const followers = await Follow.query().where('followed_id', user.id).preload('follower')
      list = followers.map((f) => f.follower)
    } else if (type === 'followings') {
      const followings = await Follow.query().where('follower_id', user.id).preload('followed')
      list = followings.map((f) => f.followed)
    } else {
      return view.render('errors/not-found')
    }

    return view.render('pages/folowsLists', { user, users: list, type })
  }
}
