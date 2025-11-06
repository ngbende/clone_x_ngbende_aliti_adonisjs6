/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
// import type { HttpContext } from '@adonisjs/core/http'
import AuthenthisController from '#controllers/authenthis_controller'
import { middleware } from '#start/kernel'
import GestionTweetsController from '#controllers/gestion_tweets_controller'
import profilesController from '#controllers/profiles_controller'
import InteractionsTweetsController from '#controllers/interactions_tweets_controller'
import FollowsController from '#controllers/follows_controller'
import SearchController from '#controllers/searches_controller'
import BlocksController from '#controllers/blocks_controller'

import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import repl from '@adonisjs/core/services/repl'
import FollowRequestsController from '#controllers/follow_requests_controller'
import ModifProfilesController from '#controllers/modif_profiles_controller'
import HashtagsController from '#controllers/hashtags_controller'
import GrokController from '#controllers/groks_controller'
router.on('/').render('pages/auth/homeAuth')

// route pour la page d'acceuil
// router.get('/home', [AuthenthisController, 'index']).as('home.index').use(middleware.auth())

// route pour afficher la page d'inscription

router
  .get('/signUp', ({ view }: HttpContext) => {
    return view.render('pages/auth/signUp')
  })
  .as('show.signUp')

router
  .get('/login', ({ view }: HttpContext) => {
    return view.render('pages/auth/login')
  })
  .as('show.login')

// router.post('/signUp', [AuthenthisController, 'showSignUp']).as('show.signUp')
router.post('/create', [AuthenthisController, 'createAccount']).as('create.user')
router.get('/verify-email', [AuthenthisController, 'verifyEmail']).as('auth.verifyEmail')

// route pour afficher la page de saisie de la clé

// router
//   .get('/key/:numMail', ({ view, params }: HttpContext) => {
//     return view.render('pages/auth/key', { email: decodeURIComponent(params.numMail) })
//   })
//   .as('show.key')

// route pour gerer la connexion
router.post('/login', [AuthenthisController, 'login']).as('auth.login')

// verifier le mot de passe et l'email
// router.post('/login/:numMail', [AuthenthisController, 'verifyKey']).as('auth.verifyKey')

// route pour afficher la page d'acceuil et proil
router.get('/home', [AuthenthisController, 'showHomeUser']).as('home.index').use(middleware.auth())
// route pour se deconnecter
router.post('/logout', [AuthenthisController, 'logout']).as('auth.logout').use(middleware.auth())

// route pour afficher et poster les tweets

router
  .post('/tweets', [GestionTweetsController, 'createTweets'])
  .as('tweets.create')
  .use(middleware.auth())

// route pour les reponses aux tweets
router
  .get('/tweet/:id', [GestionTweetsController, 'show'])
  .as('tweet.show')
  .use([middleware.auth(), middleware.checkBlocked()])

// route pour les reponses aux tweets
router
  .post('/tweets/:id/reply', [GestionTweetsController, 'reply'])
  .as('tweets.reply')
  .use([middleware.auth()])
  // , middleware.checkBlocked(), middleware.checkPrivate()

// route pour supprimer un tweet
router
  .post('/tweets/:id/delete', [GestionTweetsController, 'deleteTweet'])
  .as('tweets.delete')
  .use(middleware.auth())

// route pour afficher le profil
router.get('/profile', [profilesController, 'myProfile']).as('profile.my').use(middleware.auth())
router
  .get('/users/:id', [profilesController, 'showUserProfile'])
  .as('profile.show')
  .use([middleware.auth(), middleware.checkBlocked(), middleware.checkPrivate()])

// route pour les interactions (like/unlike) sur les tweets
router
  .post('/tweets/:id/like', [InteractionsTweetsController, 'toggleLike'])
  .as('tweets.like')
  .use([middleware.auth(), middleware.checkBlocked(), middleware.checkPrivate()])
// route pour les retweets
router
  .post('/tweets/:id/retweet', [InteractionsTweetsController, 'toggleRetweet'])
  .as('tweets.retweet')
  .use([middleware.auth(), middleware.checkBlocked(), middleware.checkPrivate()])

// route pour les reponses aux tweets dans la page profil
router
  .get('/profile/tweets/:id/reply', [profilesController, 'repliesPartial'])
  .as('profile.tweets.reply')
  .use(middleware.auth())

// routes pour les follow/unfollow
router
  .post('/follow/:id/toggle', [FollowsController, 'toggleFollow'])
  .as('user.follow')
  .use([middleware.auth(), middleware.checkBlocked(), middleware.checkPrivate()])

// router
//   .post('/unfollow/:id', [FollowsController, 'unfollowUser'])
//   .as('user.unfollow')
//   .use(middleware.auth())

// routes pour récupérer les followers et followings
router
  .get('/users/:id/followers', [FollowsController, 'getFollowers'])
  .as('user.followers')
  .use([middleware.auth(), middleware.checkBlocked(), middleware.checkPrivate()])

router
  .get('/users/:id/followings', [FollowsController, 'getFollowings'])
  .as('user.followings')
  .use([middleware.auth(), middleware.checkBlocked(), middleware.checkPrivate()])

// routes pour les tweets des utilisateurs suivis
router
  .get('/tweets/following', [FollowsController, 'tweetsFollowing'])
  .as('tweets.following')
  .use(middleware.auth())

// routes pour la liste des followers et followings
// start/routes.ts
router
  .get('/profile/:username/:type', [profilesController, 'showFollows'])
  .where('type', 'followers|followings')
  .as('profile.follows')
  .use([middleware.auth(), middleware.checkBlocked()])

// route pour la recherche
router.get('/search', [SearchController, 'index']).as('search')

// routes pour les blocages
router
  .post('/users/:id/block', [BlocksController, 'toggle'])
  .as('user.block')
  .use(middleware.auth())

// route pour les demandes de suivi et compte privée
// Toggle follow / demande
router
  .post('/follow/:id/request', [FollowRequestsController, 'toggle'])
  .as('user.request')
  .use([middleware.auth(), middleware.checkBlocked()])

// Accepter une demande
router
  .post('/follow-requests/:id/accept', [FollowRequestsController, 'accept'])
  .as('follow.accept')
  .use([middleware.auth()])

// Refuser une demande
router
  .post('/follow-requests/:id/reject', [FollowRequestsController, 'reject'])
  .as('follow.reject')
  .use([middleware.auth()])

// Voir mes demandes reçues
router
  .get('/follow-requests/received', [FollowRequestsController, 'received'])
  .as('follow.received')
  .use([middleware.auth()])

// route pour afficher la page de modification de profil
router
  .get('/user/editProfil', [ModifProfilesController, 'modifPage'])
  .as('profile.edit')
  .use([middleware.auth()])
  

// route pour mettre le compte en prive
router
  .post('/user/updateProfile', [ModifProfilesController, 'updateAllProfile'])
  .as('user.updateProfil')
  .use([middleware.auth()])

// route pour afficher les tweet_hashtags
router
  .get('/hashtag/:tag', [HashtagsController, 'showHashtags'])
  .as('hashtag.show')
  .use([middleware.auth()])

// les routes pour l'utilisation de grok
router
  .group(() => {
    router.post('/generate', [GrokController, 'generateTweet']).as('grok.generate')
    router.post('/suggest', [GrokController, 'suggestHashtags']).as('grok.suggest')
    router.post('/analyze', [GrokController, 'analyzeTweet']).as('grok.analyze')
  })
  .prefix('/grok') .use(middleware.auth()) // ✅ Protection par authentification

// ✅ Route pour afficher la page IA Grok
router
  .get('/grok', async ({ view, auth }) => {
    await auth.check()
    return view.render('pages/grok')
  })
  .as('grok.page')
  .use(middleware.auth())

// ✅ Routes API AUTH pour test avec script externe
// ✅ Routes API AUTH + FOLLOW
// router
//   .group(() => {
//     router.post('/login', [AuthenthisController, 'apiLogin'])
//     router.post('/logout', [AuthenthisController, 'apiLogout']).use(middleware.auth())

//     router.post('/follow/:id', [FollowsController, 'followUser']).use(middleware.auth())
//     router.post('/unfollow/:id', [FollowsController, 'unfollowUser']).use(middleware.auth())

//     router.get('/users/:id/followers', [FollowsController, 'getFollowers']).use(middleware.auth())
//     router.get('/users/:id/followings', [FollowsController, 'getFollowings']).use(middleware.auth())
//   })
//   .prefix('api')
