import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

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
  public async updatePrivate({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!

      // Récupère la valeur du checkbox
      const isPrivate = request.input('isPrivate') ? true : false

      // Console log pour voir l'état
      console.log('Valeur reçue du checkbox isPrivate :', isPrivate)

      user.isPrivate = isPrivate

      await user.save()
      console.log('Mise à jour effectuée, isPrivate actuel :', user.isPrivate)

      return response.redirect().back()
    } catch (error) {
      console.error('Erreur toggle block:', error)
    }
  }
}
