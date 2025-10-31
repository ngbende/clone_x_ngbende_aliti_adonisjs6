import type { HttpContext } from '@adonisjs/core/http'
import { createAcountValidator } from '#validators/validation_info'
import User from '#models/user'
import mail from '@adonisjs/mail/services/main'
import crypto from 'node:crypto'
import env from '#start/env'
import Tweet from '#models/tweet'
import Follow from '#models/follow'

export default class AuthenthisController {
  public async showHomeUser({ view, auth }: HttpContext) {
    const tweets = await Tweet.query()
      .whereNull('parentId') // 🔹 uniquement les tweets parents
      .preload('user')
      .preload('medias') // pour récupérer l'utilisateur lié
      .orderBy('created_at', 'desc')
    // Récupérer les suggestions
    const suggestions = await User.query().whereNot('id', auth.user!.id)

    // Vérifier pour chaque suggestion si l'utilisateur connecté les suit déjà
    const suggestionsWithFollowState = await Promise.all(
      suggestions.map(async (user) => {
        const isFollowing = await Follow.query()
          .where('followerId', auth.user!.id)
          .andWhere('followedId', user.id)
          .first()

        return {
          ...user.toJSON(),
          isFollowing: !!isFollowing,
        }
      })
    )
    return view.render('pages/home', {
      User: auth.user,
      tweets, // on envoie les tweets à la vue
      suggestions: suggestionsWithFollowState,
    })
  }

  public async showSignUp({ view }: HttpContext) {
    return view.render('pages/auth/signUp')
  }

  public async showLogin({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  public async createAccount({ view, request }: HttpContext) {
    try {
      const { nom, prenom, email, telephone, password } =
        await request.validateUsing(createAcountValidator)
      // const existingUser = await User.findBy('email', email)
      // if (existingUser) {
      //   return view.render('authenthis/create_account', {
      //     error: 'Email already in use. Please use a different email.',
      //   })
      // }
      const verificationToken = crypto.randomBytes(32).toString('hex')
      const user = await User.create({
        nom: nom,
        prenom: prenom,
        email: email,
        telephone: telephone ?? undefined,
        password: password,
        verified: false,
        verificationToken: verificationToken,
      })
      const appUrl = env.get('APP_URL')
      //  Crée le lien de vérification
      const verificationLink = `${appUrl}/verify-email?token=${verificationToken}`
      //  Envoie un mail avec le lien de vérification
      await mail.send((message) => {
        message
          .to(user.email)
          .from('ngbendej@gmail.com') // <- ton email Gmail
          .subject('Verify your email address').html(`
      <h1> Verify email address </h1>
      <p>
        <a href="${verificationLink}">
          Click here
        </a> to verify your email address
      </p>
    `)
      })
      console.log('✅ Email envoyé à', user.email)

      // return view.render('pages/auth/signUp', {
      //   success: 'Compte créé ! Vérifiez votre email pour activer votre compte.',
      // })
      console.log('User created successfully')
      return view.render('pages/auth/login')

      // return view.render('authenthis/create_account', { success: 'Compte créé avec succès !' })
    } catch (error) {
      console.error('Error creating user:', error)
      return view.render('pages/auth/signUp', {
        error: 'Une erreur est survenue lors de la création du compte. Veuillez réessayer.',
      })
    }
  }

  public async verifyEmail({ request, view }: HttpContext) {
    const token = request.input('token') // récupère ?token=xxx

    if (!token) {
      return view.render('pages/auth/login', {
        error: 'Lien de vérification invalide.',
      })
    }

    const user = await User.findBy('verificationToken', token)

    if (!user) {
      return view.render('pages/auth/login', {
        error: 'Token invalide ou utilisateur non trouvé.',
      })
    }

    user.verified = true
    user.verificationToken = null
    await user.save()

    return view.render('pages/auth/login', {
      success: 'Email vérifié ! Vous pouvez maintenant vous connecter.',
    })
  }

  public async login({ view, request, response, auth }: HttpContext) {
    const email = request.input('numMail')
    const password = request.input('passwordAuth')

    try {
      // Vérifie credentials
      const user = await User.verifyCredentials(email, password)

      // Connecte l'utilisateur
      await auth.use('web').login(user)

      console.log('User logged in:', user.email)
      return response.redirect().toRoute('home.index')
    } catch (error: any) {
      // Si c'est une erreur de credentials, on affiche un message clair
      if (error.code === 'E_INVALID_CREDENTIALS') {
        console.error('Login failed:', error.message)
        return view.render('pages/auth/login', {
          error: 'Email ou mot de passe incorrect. Veuillez réessayer.',
        })
      }

      // Pour toutes les autres erreurs
      console.error('Unexpected error during login:', error)
      return view.render('pages/auth/login', {
        error: 'Une erreur est survenue. Veuillez réessayer plus tard.',
      })
    }
  }

  public async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()

    // Supprime explicitement le cookie de session
    // response.clearCookie('adonis-session')

    return response.redirect().toRoute('show.login')
  }

  // public async verifyKey({ view, request, auth, params, response }: HttpContext) {
  //   try {
  //     const password = request.input('passwordAuth')
  //     const numMail = decodeURIComponent(params.numMail)
  //     const user = await User.verifyCredentials(numMail, password)
  //     await auth.use('web').login(user)
  //     return response.redirect().toRoute('home.index', { email: user.email })
  //   } catch (error) {
  //     console.error('Error during key verification:', error)
  //     return view.render('pages/auth/key', {
  //       error: 'Une erreur est survenue lors de la vérification de la clé. Veuillez réessayer.',
  //     })
  //   }
  // }
}
