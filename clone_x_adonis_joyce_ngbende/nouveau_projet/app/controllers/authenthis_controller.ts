import type { HttpContext } from '@adonisjs/core/http'
import { createAcountValidator } from '#validators/validation_info'
import User from '#models/user'
// import mail from '@adonisjs/mail/services/main'
import crypto from 'node:crypto'
import env from '#start/env'
import Tweet from '#models/tweet'
import Follow from '#models/follow'
import sgMail from '@sendgrid/mail'

export default class AuthenthisController {
  public async showHomeUser({ view, auth }: HttpContext) {
    const tweets = await Tweet.query()
      .whereNull('parentId') // 🔹 uniquement les tweets parents
      .preload('user')
      .preload('medias')
      .preload('likes')     
      .preload('retweets')
      .preload('replies', (repliesQuery) => {
        repliesQuery
          .preload('user')
          .preload('medias') // <-- important !
          .preload('hashtags')
          .preload('likes')    
          .preload('retweets') 
  })
      .preload('hashtags') // pour récupérer l'utilisateur lié
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
    // 🔹 Ici on transforme le content en contentClean
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
       // contentClean pour les replies
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

  public async createAccount({ view, request, response }: HttpContext) {
    try {
      const { nom, prenom, email, telephone, password } =
        await request.validateUsing(createAcountValidator)

      // Vérifie si l'utilisateur existe déjà
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        return view.render('pages/auth/signUp', {
          error: 'Cet email est déjà utilisé. Veuillez en choisir un autre.',
        })
      }

      // Crée le token de vérification
      const verificationToken = crypto.randomBytes(32).toString('hex')
      const user = await User.create({
        nom,
        prenom,
        email,
        telephone: telephone ?? undefined,
        password,
        verified: false,
        verificationToken,
      })

      const appUrl = env.get('APP_URL')
      const verificationLink = `${appUrl}/verify-email?token=${verificationToken}`

      // Tente d'envoyer l'email de vérification, mais ne bloque pas la création si ça échoue
      try {
        sgMail.setApiKey(env.get('SENDGRID_API_KEY')!)

        const msg = {
          to: user.email, // 👈 le destinataire (l'utilisateur créé)
          from: {
            email: env.get('MAIL_FROM_ADDRESS')!, // 👈 ton expéditeur vérifié
            name: env.get('MAIL_FROM_NAME')!,
          },
          subject: 'Vérifie ton adresse e-mail',
          html: `
      <h1>Bienvenue sur CloneX !</h1>
      <p>Merci de t’être inscrit. Clique sur le lien ci-dessous pour vérifier ton adresse e-mail :</p>
      <p><a href="${verificationLink}">Vérifier mon adresse e-mail</a></p>
    `,
        }

        await sgMail.send(msg)
        console.log('✅ Email envoyé à', user.email)
      } catch (mailError) {
        console.warn('⚠️ Impossible d’envoyer l’email:', mailError.message)
      }

      console.log('User created successfully')

      // Redirection vers login, succès optionnel affiché là-bas
      return response.redirect().toRoute('show.login')
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
      console.log('🔐 Tentative de connexion:', { email, password })
    try {
      // Vérifie credentials
      const user = await User.verifyCredentials(email, password)
     
        
        // ✅ AJOUT: Vérifie si l'email est vérifié
    if (!user.verified) {
      return view.render('pages/auth/login', {
        error: 'Veuillez vérifier votre email avant de vous connecter. Vérifiez votre boîte de réception.',
      })
    }
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
// function route(arg0: string, arg1: { tag: string }) {
//   throw new Error('Function not implemented.')
// }
