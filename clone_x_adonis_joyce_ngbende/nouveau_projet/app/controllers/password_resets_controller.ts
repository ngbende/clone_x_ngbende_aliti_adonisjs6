import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import crypto from 'node:crypto'
import { DateTime } from 'luxon'
import sgMail from '@sendgrid/mail'
import env from '#start/env'

export default class PasswordResetsController {
  // Affiche le formulaire "Mot de passe oublié"
  public async showForgotPassword({ view }: HttpContext) {
    return view.render('pages/auth/forgot_password')
  }

  // Traite la demande de réinitialisation
  public async sendResetLink({ request, view }: HttpContext) {
    const email = request.input('email')

    try {
      const user = await User.findBy('email', email)
      if (!user) {
        // Pour la sécurité, on ne révèle pas si l'email existe
        return view.render('pages/auth/forgot_password', {
          success: 'Si votre email existe, vous recevrez un lien de réinitialisation.'
        })
      }
   await PasswordResetToken.query().where('user_id', user.id).delete()
      // Génère un token sécurisé
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = DateTime.now().plus({ hours: 1 }) // Valide 1h

      // Sauvegarde le token
      await PasswordResetToken.create({
        userId: user.id,
        token,
        expiresAt,
      })

      // Envoie l'email
      const appUrl = env.get('APP_URL')
      const resetLink = `${appUrl}/reset-password?token=${token}`

      sgMail.setApiKey(env.get('SENDGRID_API_KEY')!)
      await sgMail.send({
        to: user.email,
        from: {
          email: env.get('MAIL_FROM_ADDRESS')!,
          name: env.get('MAIL_FROM_NAME')!,
        },
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <h1>Réinitialisation de mot de passe</h1>
          <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          <p><a href="${resetLink}">Réinitialiser mon mot de passe</a></p>
          <p><small>Ce lien expirera dans 1 heure.</small></p>
        `,
      })

      return view.render('pages/auth/forgot_password', {
        success: 'Si votre email existe, vous recevrez un lien de réinitialisation.'
      })

    } catch (error) {
      console.error('Erreur envoi lien reset:', error)
      return view.render('pages/auth/forgot_password', {
        error: 'Une erreur est survenue. Veuillez réessayer.'
      })
    }
  }

  // Affiche le formulaire de nouveau mot de passe
  public async showResetForm({ request, view }: HttpContext) {
    const token = request.input('token')
    
    if (!token) {
      return view.render('pages/auth/login', {
        error: 'Lien de réinitialisation invalide.'
      })
    }

    return view.render('pages/auth/reset_password', { token })
  }

  // Traite la réinitialisation
  public async resetPassword({ request, view }: HttpContext) {
    const { token, password, password_confirmation } = request.only([
      'token', 'password', 'password_confirmation'
    ])

    try {
      // Valide les mots de passe
      if (password !== password_confirmation) {
        return view.render('pages/auth/reset_password', {
          token,
          error: 'Les mots de passe ne correspondent pas.'
        })
      }

      if (password.length < 8) {
        return view.render('pages/auth/reset_password', {
          token,
          error: 'Le mot de passe doit faire au moins 8 caractères.'
        })
      }

      // Cherche le token valide
      const resetToken = await PasswordResetToken.query()
        .where('token', token)
        .preload('user')
        .first()

      if (!resetToken || !resetToken.isValid()) {
        return view.render('pages/auth/login', {
          error: 'Lien de réinitialisation invalide ou expiré.'
        })
      }

      // Met à jour le mot de passe
      resetToken.user.password = password
      await resetToken.user.save()

      // Supprime le token utilisé
      await resetToken.delete()

      return view.render('pages/auth/login', {
        success: 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.'
      })

    } catch (error) {
      console.error('Erreur reset password:', error)
      return view.render('pages/auth/reset_password', {
        token,
        error: 'Une erreur est survenue. Veuillez réessayer.'
      })
    }
  }
}