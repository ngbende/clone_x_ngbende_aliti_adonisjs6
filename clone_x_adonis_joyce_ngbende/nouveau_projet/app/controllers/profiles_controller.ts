import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import User from '#models/user'
import Retweet from '#models/retweet'
import Follow from '#models/follow'
import Block from '#models/block'

export default class ProfilesController {
  // Profil de l'utilisateur connecté
  public async myProfile({ auth, view }: HttpContext) {
    const user = await User.query()
      .where('id', auth.user!.id)
      .preload('followers')
      .preload('following')
      .preload('replies').preload('tweets')
      .firstOrFail()

    if (!user) {
      return view.render('pages/auth/login', {
        error: 'Connectez-vous pour voir votre profil.',
      })
    }

    // Tweets écrits par le user
 const tweets = await Tweet.query()
   .where('userId', user.id)      
  .whereNull('parentId')           
  .preload('user')
  .preload('likes')      
  .preload('retweets')   
  .preload('medias')
  .preload('replies', (repliesQuery) => {
    repliesQuery
      .preload('user')
      .preload('medias')
      .preload('likes')    
      .preload('retweets') 
  })

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

  // RÉPONSES
  const userReplies = await Tweet.query()
    .where('userId', user.id)
    .whereNotNull('parentId')
    .preload('user')
    .preload('likes')
    .preload('retweets')
    .preload('medias')
    .preload('parent', (parentQuery) => {
      parentQuery.preload('user')
    })
    .orderBy('createdAt', 'desc')

  // MÉDIAS
  const userMedias = await Tweet.query()
    .where('userId', user.id)
     .whereHas('medias', () => {}) 
    .preload('user')
    .preload('likes')
    .preload('retweets')
    .preload('medias')
    .orderBy('createdAt', 'desc')

  // LIKES
  const userLikes = await Tweet.query()
    .whereHas('likes', (likeQuery) => {
      likeQuery.where('userId', user.id)
    })
    .preload('user')
    .preload('likes')
    .preload('retweets')
    .preload('medias')
    .orderBy('createdAt', 'desc')

    //  Transformation des hashtags EN contentClean
allTweets.forEach((tweet) => {
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

  // Aussi pour les réponses si elles existent
  if (tweet.replies && tweet.replies.length > 0) {
    tweet.replies.forEach((reply: any) => {
      if (reply.hashtags && reply.hashtags.length > 0) {
        let content = reply.content
        reply.hashtags.forEach((h: any) => {
          const regex = new RegExp(`#${h.texteHashtag}`, 'gi')
          content = content.replace(
            regex,
            `<a href="/hashtag/${h.texteHashtag}" class="text-blue-400 hover:underline">#${h.texteHashtag}</a>`
          )
        })
        reply.contentClean = content
      } else {
        reply.contentClean = reply.content
      }
    })
  }
})
// Transformation des hashtags pour USER REPLIES
userReplies.forEach((tweet) => {
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

// Transformation des hashtags pour USER MEDIAS
userMedias.forEach((tweet) => {
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

// Transformation des hashtags pour USER LIKES
userLikes.forEach((tweet) => {
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

    return view.render('pages/profile', { user, tweets: allTweets, isBlocked: false, userReplies, userMedias, userLikes })  
  }

  
  //  Profil d'un autre utilisateur
   
  public async showUserProfile({ params, view, auth }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .preload('followers')
      .preload('following')
      .firstOrFail()


      // - Calcul du statut de follow
  let followStatus = 'none'
  if (auth.user) {
    const existingFollow = await Follow.query()
      .where('follower_id', auth.user.id)
      .andWhere('followed_id', user.id)
      .first()
    
    followStatus = existingFollow ? 'followed' : 'none'
  }

    // Tweets écrits par cet utilisateur
   const tweets = await Tweet.query()
   .where('userId', user.id)        
  .whereNull('parentId')      
  .preload('user')
  .preload('likes')      
  .preload('retweets')   
  .preload('medias')
  .preload('replies', (repliesQuery) => {
    repliesQuery
      .preload('user')
      .preload('medias')
      .preload('likes')    // ✅
      .preload('retweets') // ✅
  })

    // Tweets qu'il a retweetés
    const retweetRecords = await Retweet.query()
      .where('userId', user.id)
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
      // RÉPONSES
  const userReplies = await Tweet.query()
    .where('userId', user.id)
    .whereNotNull('parentId')
    .preload('user')
    .preload('likes')
    .preload('retweets')
    .preload('medias')
    .preload('parent', (parentQuery) => {
      parentQuery.preload('user')
    })
    .orderBy('createdAt', 'desc')

  // MÉDIAS
  const userMedias = await Tweet.query()
    .where('userId', user.id)
    .whereHas('medias', () => {})
    .preload('user')
    .preload('likes')
    .preload('retweets')
    .preload('medias')
    .orderBy('createdAt', 'desc')

  // LIKES
  const userLikes = await Tweet.query()
    .whereHas('likes', (likeQuery) => {
      likeQuery.where('userId', user.id)
    })
    .preload('user')
    .preload('likes')
    .preload('retweets')
    .preload('medias')
    .orderBy('createdAt', 'desc')


    // Transformation des hashtags EN contentClean
allTweets.forEach((tweet) => {
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

  // Aussi pour les réponses si elles existent
  if (tweet.replies && tweet.replies.length > 0) {
    tweet.replies.forEach((reply: any) => {
      if (reply.hashtags && reply.hashtags.length > 0) {
        let content = reply.content
        reply.hashtags.forEach((h: any) => {
          const regex = new RegExp(`#${h.texteHashtag}`, 'gi')
          content = content.replace(
            regex,
            `<a href="/hashtag/${h.texteHashtag}" class="text-blue-400 hover:underline">#${h.texteHashtag}</a>`
          )
        })
        reply.contentClean = content
      } else {
        reply.contentClean = reply.content
      }
    })
  }
})
// Transformation des hashtags pour USER REPLIES
userReplies.forEach((tweet) => {
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

// Transformation des hashtags pour USER MEDIAS
userMedias.forEach((tweet) => {
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

// Transformation des hashtags pour USER LIKES
userLikes.forEach((tweet) => {
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
    // Vérifier si l'utilisateur connecté a bloqué ce profil
    const isBlocked = await user.isBlockedBy(auth.user!.id)
    // Dans showUserProfile
    const blocked = await Block.query()
      .where('blocker_id', user.id) // le profil que je consulte
      .andWhere('blocked_id', auth.user!.id) // moi
      .first()

    if (blocked) {
      return view.render('pages/profile', { user, tweets: [], userReplies: [], userMedias: [], userLikes: [], isBlocked: true })
    }

    return view.render('pages/profile', {  user: {
      ...user.toJSON(),
      followStatus: followStatus //ICI
    }, tweets: allTweets, isBlocked, userReplies, userMedias, userLikes })
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
