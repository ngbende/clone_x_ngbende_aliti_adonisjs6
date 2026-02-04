import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import crypto from 'node:crypto'
import { DateTime } from 'luxon'
import sgMail from '@sendgrid/mail'
import env from '#start/env'
import { passwordResetValidator } from '#validators/password_reset'
import { errors } from '@vinejs/vine'
export default class PasswordResetsController {
  // Affiche le formulaire "Mot de passe oublié"
  public async showForgotPassword({ view }: HttpContext) {
    console.log('🔐 Affichage formulaire mot de passe oublié')
    return view.render('pages/auth/forgot_password')
  }

  // Traite la demande de réinitialisation
  public async sendResetLink({ request, response, session }: HttpContext) {
    const email = request.input('email')
    console.log('📧 Demande de réinitialisation pour:', email)

    try {
      console.log('🔍 Recherche de l\'utilisateur...')
      const user = await User.findBy('email', email)
      
      // Toujours afficher le même message pour la sécurité
      session.flash('success', 'Si votre email existe, vous recevrez un lien de réinitialisation.')
      
      if (!user) {
        console.log('❌ Utilisateur non trouvé pour email:', email)
        return response.redirect().toRoute('password.request')
      }

      console.log('✅ Utilisateur trouvé:', user.id, user.email)

      // Supprimer les anciens tokens
      console.log('🗑️ Suppression des anciens tokens...')
      await PasswordResetToken.query().where('user_id', user.id).delete()
      
      // Créer un nouveau token
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = DateTime.now().plus({ hours: 1 })
      console.log('🔐 Nouveau token créé:', token)

      console.log('💾 Sauvegarde du token en base...')
      await PasswordResetToken.create({
        userId: user.id,
        token,
        expiresAt,
      })

      // Préparer l'email
      const appUrl = env.get('APP_URL')
      const resetLink = `${appUrl}/reset-password?token=${token}`
      console.log('🔗 Lien de reset:', resetLink)

      console.log('📤 Configuration SendGrid...')
      const sendgridKey = env.get('SENDGRID_API_KEY')
      const mailFrom = env.get('MAIL_FROM_ADDRESS')
      const mailName = env.get('MAIL_FROM_NAME')
      
      console.log('🔑 SendGrid Key présent:', !!sendgridKey)
      console.log('📨 Email from:', mailFrom)
      console.log('👤 Nom from:', mailName)

      if (!sendgridKey) {
        throw new Error('SendGrid API Key manquante')
      }

      sgMail.setApiKey(sendgridKey)
      
      console.log('🚀 Envoi de l\'email...')
      await sgMail.send({
        to: user.email,
        from: {
          email: mailFrom!,
          name: mailName!,
        },
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <h1>Réinitialisation de mot de passe</h1>
          <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          <p><a href="${resetLink}">Réinitialiser mon mot de passe</a></p>
          <p><small>Ce lien expirera dans 1 heure.</small></p>
        `,
      })

      console.log('✅ Email envoyé avec succès à:', user.email)
      return response.redirect().toRoute('password.request')

    } catch (error) {
      console.error('❌ Erreur détaillée envoi lien reset:')
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
      session.flash('errors', { general: 'Une erreur est survenue. Veuillez réessayer.' })
      return response.redirect().toRoute('password.request')
    }
  }

  // Affiche le formulaire de nouveau mot de passe
  public async showResetForm({ request, view, session, response }: HttpContext) {
    const token = request.input('token')
    console.log('🔑 Token reçu dans showResetForm:', token)
    
    if (!token) {
      console.log('❌ Token manquant')
      session.flash('errors', { general: 'Token de réinitialisation manquant.' })
      return response.redirect().toRoute('password.request')
    }

    try {
      // Vérifier si le token est valide
      console.log('🔍 Recherche du token en base...')
      const resetToken = await PasswordResetToken.query()
        .where('token', token)
        .first()

      console.log('✅ Token trouvé en base:', !!resetToken)
      
      if (resetToken) {
        console.log('⏰ Expiration:', resetToken.expiresAt.toString())
        console.log('✅ Token valide:', resetToken.isValid())
      }

      if (!resetToken || !resetToken.isValid()) {
        console.log('❌ Token invalide ou expiré')
        session.flash('errors', { general: 'Lien de réinitialisation invalide ou expiré.' })
        return response.redirect().toRoute('password.request')
      }

      console.log('✅ Affichage formulaire reset password')
      return view.render('pages/auth/reset_password', { token })

    } catch (error) {
      console.error('❌ Erreur showResetForm:', error)
      session.flash('errors', { general: 'Une erreur est survenue.' })
      return response.redirect().toRoute('password.request')
    }
  }

  // Traite la réinitialisation
  public async resetPassword({ request, response, session }: HttpContext) {
    const { token, password } = await request.validateUsing(passwordResetValidator)

    console.log('🔄 Début resetPassword - Token:', token)
    console.log('🔐 Nouveau password:', password ? '***' : 'manquant')
    // console.log('🔐 Password confirmation:', password_confirmation ? '***' : 'manquant')

    try {
      // Validation des mots de passe
    //   if (password !== password_confirmation) {
    //     console.log('❌ Mots de passe ne correspondent pas')
    //     session.flash('errors', { general: 'Les mots de passe ne correspondent pas.' })
    //     return response.redirect().toPath(`/reset-password?token=${token}`)
    //   }

    //   if (password.length < 8) {
    //     console.log('❌ Mot de passe trop court:', password.length)
    //     session.flash('errors', { general: 'Le mot de passe doit faire au moins 8 caractères.' })
    //     return response.redirect().toPath(`/reset-password?token=${token}`)
    //   }

      // Chercher le token avec l'utilisateur
      console.log('🔍 Recherche du token avec user...')
      const resetToken = await PasswordResetToken.query()
        .where('token', token)
        .preload('user')
        .first()

      console.log('✅ Token avec user trouvé:', !!resetToken)
      console.log('✅ User associé:', resetToken?.user?.id)

      if (!resetToken || !resetToken.isValid()) {
        console.log('❌ Token invalide dans resetPassword')
        session.flash('errors', { general: 'Lien de réinitialisation invalide ou expiré.' })
        return response.redirect().toRoute('password.request')
      }

      // Mettre à jour le mot de passe
      console.log('💾 Mise à jour du mot de passe...')
      resetToken.user.password = password
      await resetToken.user.save()
      
      // Supprimer le token utilisé
      console.log('🗑️ Suppression du token utilisé...')
      await resetToken.delete()

      console.log('✅ Mot de passe réinitialisé avec succès!')
      session.flash('success', 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.')
      return response.redirect().toRoute('show.login')

    } catch (error) {
     if (error instanceof errors.E_VALIDATION_ERROR) {
      // Redirige avec le token pour garder le contexte
      const token = request.input('token')
      return response.redirect().toPath(`/reset-password?token=${token}`) // ✅ ICI
    }
    
    console.error('❌ Erreur détaillée reset password:')
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    session.flash('errors', { general: 'Une erreur est survenue. Veuillez réessayer.' })
    const token = request.input('token')
    return response.redirect().toPath(`/reset-password?token=${token}`) // ✅ ICI
    }
  }
}