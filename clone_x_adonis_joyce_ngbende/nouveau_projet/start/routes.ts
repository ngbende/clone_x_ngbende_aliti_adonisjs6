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

import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import repl from '@adonisjs/core/services/repl'

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
router.get('/tweet/:id', [GestionTweetsController, 'show']).as('tweet.show')

// route pour les reponses aux tweets
router
  .post('/tweets/:id/reply', [GestionTweetsController, 'reply'])
  .as('tweets.reply')
  .use(middleware.auth())

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
  .use(middleware.auth())

// route pour les interactions (like/unlike) sur les tweets
router
  .post('/tweets/:id/like', [InteractionsTweetsController, 'toggleLike'])
  .as('tweets.like')
  .use(middleware.auth())

// route pour les retweets
router
  .post('/tweets/:id/retweet', [InteractionsTweetsController, 'toggleRetweet'])
  .as('tweets.retweet')
  .use(middleware.auth())

// route pour les reponses aux tweets dans la page profil
router
  .get('/profile/tweets/:id/reply', [profilesController, 'repliesPartial'])
  .as('profile.tweets.reply')
  .use(middleware.auth())
