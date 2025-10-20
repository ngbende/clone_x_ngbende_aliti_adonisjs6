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

import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

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
