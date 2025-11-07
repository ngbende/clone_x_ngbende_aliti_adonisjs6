import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/update_profile'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import hash from '@adonisjs/core/services/hash' // ✅ IMPORT CORRECT
export default class ModifProfilesController {
  public async modifPage({ view, auth, response }: HttpContext) {
    const user = await User.query()
      .where('id', auth.user!.id)
      .preload('followers')
      .preload('following')
      .firstOrFail()
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }
    return view.render('pages/modifProfil', { user })
  }
   /**
   * ✅ Méthode unique pour mettre à jour : bio, localisation, site web, confidentialité et images
   * - Tous les champs sont optionnels : seules les valeurs envoyées seront modifiées
   * - Gère 3 types de données : texte, checkbox, fichiers
   */
  public async updateAllProfile({ auth, request, response,session }: HttpContext) {
    try {
      const user = auth.user!
      if (!user) {
        return response.unauthorized('Utilisateur non authentifié')
      }

      // ============================
      // 🟦 1. Mise à jour des champs texte (bio, location, website)
      // Valide uniquement les données texte via Vine
      // ============================
     const { bio, location, website, current_password, new_password } = await request.validateUsing(updateProfileValidator)
user.bio = bio ?? null
user.location = location ?? null
user.website = website ?? null


      // ============================
      // 🟨 2. Mise à jour de la confidentialité du compte (checkbox)
      // ============================
      const isPrivate = request.input('isPrivate') ? true : false
      user.isPrivate = isPrivate

            // 🔐 3. GESTION DU MOT DE PASSE - CORRECTION
      // ============================
      if (new_password) {
        // Vérifie que le mot de passe actuel est fourni
        if (!current_password) {
          session.flash('errors', { current_password: 'Veuillez entrer votre mot de passe actuel pour modifier le mot de passe.' })
          return response.redirect().back()
        }

        // ✅ CORRECTION : Utilise hash.make() pour comparer
        const isValidPassword = await hash.verify(user.password, current_password)
        if (!isValidPassword) {
          session.flash('errors', { current_password: 'Le mot de passe actuel est incorrect.' })
          return response.redirect().back()
        }

        // Met à jour le mot de passe
        user.password = new_password
      }
      // ============================
      // 🟥 3. Mise à jour des fichiers images (photo profil + bannière)
      // Ici pas de validation Vine car ce sont des fichiers
      // ============================
     const photoProfil = request.file('photoProfil', {
  size: '5mb',
  extnames: ['jpg', 'jpeg', 'png'],
})
      const coverPicture = request.file('coverPicture', {
  size: '5mb',
  extnames: ['jpg', 'jpeg', 'png'],
})

      // Upload photo de profil si fournie
      if (photoProfil && photoProfil.tmpPath) {
        const fileName = `${cuid()}.${photoProfil.extname}`
        const filePath = `uploads/${fileName}`
        await photoProfil.move(app.publicPath('uploads'), {
          name: fileName,
        })
        user.photoProfil = filePath
      }else if (photoProfil && !photoProfil.isValid) {
  return response.badRequest(photoProfil.errors)
}

      // Upload couverture si fournie
      if (coverPicture && coverPicture.tmpPath) {
        const fileName = `${cuid()}.${coverPicture.extname}`
        const filePath = `uploads/${fileName}`
        await coverPicture.move(app.publicPath('uploads'), {
          name: fileName,
        })
        user.coverPicture = filePath
      }else if (coverPicture && !coverPicture.isValid) {
  return response.badRequest(coverPicture.errors)
}

      // ============================
      // 💾 4. Sauvegarde finale en base
      // ============================
      await user.save()
        session.flash('success', 'Profil mis à jour avec succès!')
      return response.redirect().back()
       } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error)
      session.flash('errors', { general: 'Une erreur est survenue lors de la mise à jour du profil.' })
      return response.redirect().back() // ✅ CORRECTION : redirect().back() au lieu de status().send()
    }
  }
}
