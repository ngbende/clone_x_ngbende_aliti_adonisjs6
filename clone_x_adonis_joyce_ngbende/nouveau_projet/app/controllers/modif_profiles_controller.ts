import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/update_profile'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'

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
  public async updateAllProfile({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      if (!user) {
        return response.unauthorized('Utilisateur non authentifié')
      }

      // ============================
      // 🟦 1. Mise à jour des champs texte (bio, location, website)
      // Valide uniquement les données texte via Vine
      // ============================
      const { bio, location, website } = await request.validateUsing(updateProfileValidator)
user.bio = bio ?? null
user.location = location ?? null
user.website = website ?? null


      // ============================
      // 🟨 2. Mise à jour de la confidentialité du compte (checkbox)
      // ============================
      const isPrivate = request.input('isPrivate') ? true : false
      user.isPrivate = isPrivate

      // ============================
      // 🟥 3. Mise à jour des fichiers images (photo profil + bannière)
      // Ici pas de validation Vine car ce sont des fichiers
      // ============================
      const photoProfil = request.file('photoProfil')
      const coverPicture = request.file('coverPicture')

      // Upload photo de profil si fournie
      if (photoProfil && photoProfil.tmpPath) {
        const fileName = `${cuid()}.${photoProfil.extname}`
        const filePath = `uploads/${fileName}`
        await photoProfil.move(app.publicPath('uploads'), {
          name: fileName,
        })
        user.photoProfil = filePath
      }

      // Upload couverture si fournie
      if (coverPicture && coverPicture.tmpPath) {
        const fileName = `${cuid()}.${coverPicture.extname}`
        const filePath = `uploads/${fileName}`
        await coverPicture.move(app.publicPath('uploads'), {
          name: fileName,
        })
        user.coverPicture = filePath
      }

      // ============================
      // 💾 4. Sauvegarde finale en base
      // ============================
      await user.save()

      return response.redirect().back()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error)
      return response.status(500).send('Erreur serveur lors de la mise à jour du profil.')
    }
  }
}
