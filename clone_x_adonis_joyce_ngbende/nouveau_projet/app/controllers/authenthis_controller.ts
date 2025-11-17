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

  // Calcul du followStatus pour chaque suggestion
const suggestionsWithFollowState = await Promise.all(
  suggestions.map(async (user) => {
    const existingFollow = await Follow.query()
      .where('follower_id', auth.user!.id)
      .andWhere('followed_id', user.id)
      .first()

    const followStatus = existingFollow ? 'followed' : 'none'

    return {
      ...user.toJSON(),
      followStatus: followStatus, // Utilise followStatus au lieu de isFollowing
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

  public async createAccount({ request, response, session }: HttpContext) {
    try {
      const { nom, prenom, email, telephone, password } =
        await request.validateUsing(createAcountValidator)

      // Vérifie si l'utilisateur existe déjà
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
       session.flash('errors', { general: 'Cet email est déjà utilisé. Veuillez en choisir un autre.' })
return response.redirect().toRoute('show.signUp')
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
    // CORRIGE CELUI-CI
   session.flash('errors', { general: 'Une erreur est survenue lors de la création du compte. Veuillez réessayer.' })
    return response.redirect().toRoute('show.signUp')
  }
}

  public async verifyEmail({ request, session , response }: HttpContext) {
    const token = request.input('token') // récupère ?token=xxx

    if (!token) {
      session.flash('errors', { general: 'Lien de vérification invalide.' })
    return response.redirect().toRoute('show.login')
    }

    const user = await User.findBy('verificationToken', token)

    if (!user) {
    session.flash('errors', { general: 'Token invalide ou utilisateur non trouvé.' })
    return response.redirect().toRoute('show.login')
    }

    user.verified = true
    user.verificationToken = null
    await user.save()

  session.flash('success', 'Email vérifié ! Vous pouvez maintenant vous connecter.')
  return response.redirect().toRoute('show.login')
  }

public async login({ request, response, auth, session }: HttpContext) {
  const email = request.input('numMail')
  const password = request.input('passwordAuth')
  
  try {
    const userExists = await User.findBy('email', email)
    
    if (userExists) {
      // VÉRIFICATION EMAIL - IMPORTANT
     if (!userExists.verified) {
  // AJOUT: Stocker l'email pour le bouton de renvoi
  session.flash('unverified_email', email)
  session.flash('errors', { 
    general: 'Veuillez vérifier votre adresse email avant de vous connecter.' 
  })
  return response.redirect().toRoute('show.login')
}
    }
    
    if (!userExists) {
      session.flash('errors', { general: 'Aucun compte trouvé avec cet email.' })
      return response.redirect().toRoute('show.login')
    }
    
    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)
    
    return response.redirect().toRoute('home.index')
  } catch (error: any) {
    if (error.code === 'E_INVALID_CREDENTIALS') {
      session.flash('errors', { general: 'Email ou mot de passe incorrect.' })
      return response.redirect().toRoute('show.login')
    }
    session.flash('errors', { general: 'Une erreur est survenue. Veuillez réessayer plus tard.' })
    return response.redirect().toRoute('show.login')
  }
}

  public async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()

    // Supprime explicitement le cookie de session
    // response.clearCookie('adonis-session')

    return response.redirect().toRoute('show.login')
  }

public async resendVerification({ request, response, session }: HttpContext) {
  const email = request.input('email')

  try {
    const user = await User.findBy('email', email)
    
    // Même message dans tous les cas pour la sécurité
    session.flash('success', 'Si votre email existe et n\'est pas vérifié, un nouveau lien de vérification a été envoyé.')
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé pour email:', email)
      return response.redirect().toRoute('show.login')
    }

    if (user.verified) {
      console.log('✅ Utilisateur déjà vérifié:', email)
      session.flash('success', 'Votre compte est déjà vérifié. Vous pouvez vous connecter.')
      return response.redirect().toRoute('show.login')
    }

    // Régénérer le token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    user.verificationToken = verificationToken
    await user.save()

    // Renvoyer l'email
    const appUrl = env.get('APP_URL')
    const verificationLink = `${appUrl}/verify-email?token=${verificationToken}`

    sgMail.setApiKey(env.get('SENDGRID_API_KEY')!)
    
    await sgMail.send({
      to: user.email,
      from: {
        email: env.get('MAIL_FROM_ADDRESS')!,
        name: env.get('MAIL_FROM_NAME')!,
      },
      subject: 'Nouveau lien de vérification - CloneX',
      html: `
        <h1>Nouveau lien de vérification</h1>
        <p>Voici votre nouveau lien de vérification :</p>
        <p><a href="${verificationLink}">Vérifier mon adresse e-mail</a></p>
        <p><small>Ce lien expirera dans 24 heures.</small></p>
      `,
    })

    console.log('✅ Nouvel email de vérification envoyé à:', user.email)
    return response.redirect().toRoute('show.login')

  } catch (error) {
    console.error('❌ Erreur renvoi vérification:', error)
    session.flash('errors', { general: 'Une erreur est survenue. Veuillez réessayer.' })
    return response.redirect().toRoute('show.login')
  }
}
  
}
