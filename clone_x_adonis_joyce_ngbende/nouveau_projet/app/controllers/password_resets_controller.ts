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
  public async sendResetLink({ request, response, session }: HttpContext) {
    const email = request.input('email')

    try {
      const user = await User.findBy('email', email)
      
      // Toujours afficher le même message pour la sécurité
      session.flashMessages.set('success', 'Si votre email existe, vous recevrez un lien de réinitialisation.')
      
      if (!user) {
        return response.redirect().toRoute('password.request')
      }

      // Supprimer les anciens tokens
      await PasswordResetToken.query().where('user_id', user.id).delete()
      
      // Créer un nouveau token
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = DateTime.now().plus({ hours: 1 })

      await PasswordResetToken.create({
        userId: user.id,
        token,
        expiresAt,
      })

      // Préparer l'email
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

      return response.redirect().toRoute('password.request')

    } catch (error) {
      console.error('Erreur envoi lien reset:', error)
      session.flashMessages.set('error', 'Une erreur est survenue. Veuillez réessayer.')
      return response.redirect().toRoute('password.request')
    }
  }

  // Affiche le formulaire de nouveau mot de passe
  public async showResetForm({ request, view, session, response }: HttpContext) {
    const token = request.input('token')
    
    if (!token) {
      session.flashMessages.set('error', 'Token de réinitialisation manquant.')
      return response.redirect().toRoute('password.request')
    }

    // Vérifier si le token est valide
    const resetToken = await PasswordResetToken.query()
      .where('token', token)
      .first()

    if (!resetToken || !resetToken.isValid()) {
      session.flashMessages.set('error', 'Lien de réinitialisation invalide ou expiré.')
      return response.redirect().toRoute('password.request')
    }

    return view.render('pages/auth/reset_password', { token })
  }

  // Traite la réinitialisation - CORRECTION ICI
  public async resetPassword({ request, response, session }: HttpContext) {
    const { token, password, password_confirmation } = request.only([
      'token', 'password', 'password_confirmation'
    ])

    try {
      // Validation des mots de passe
      if (password !== password_confirmation) {
        session.flashMessages.set('error', 'Les mots de passe ne correspondent pas.')
        return response.redirect().toPath(`/reset-password?token=${token}`)
      }

      if (password.length < 8) {
        session.flashMessages.set('error', 'Le mot de passe doit faire au moins 8 caractères.')
        return response.redirect().toPath(`/reset-password?token=${token}`)
      }

      // Chercher le token avec l'utilisateur
      const resetToken = await PasswordResetToken.query()
        .where('token', token)
        .preload('user')
        .first()

      if (!resetToken || !resetToken.isValid()) {
        session.flashMessages.set('error', 'Lien de réinitialisation invalide ou expiré.')
        return response.redirect().toRoute('password.request')
      }

      // Mettre à jour le mot de passe
      resetToken.user.password = password
      await resetToken.user.save()
      
      // Supprimer le token utilisé
      await resetToken.delete()

      session.flashMessages.set('success', 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.')
      return response.redirect().toRoute('show.login')

    } catch (error) {
      console.error('Erreur reset password:', error)
      session.flashMessages.set('error', 'Une erreur est survenue. Veuillez réessayer.')
      return response.redirect().toPath(`/reset-password?token=${token}`)
    }
  }
}