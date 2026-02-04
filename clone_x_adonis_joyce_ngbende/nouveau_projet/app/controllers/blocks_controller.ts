import Block from '#models/block'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class BlocksController {
  public async toggle({ auth, params, response }: HttpContext) {
    try {
      const blocker = auth.user!
      const blockedId = Number(params.id)

      // Vérifie qu’on ne se bloque pas soi-même
      if (blocker.id === blockedId) {
        return response.redirect().back()
      }

      const blockedUser = await User.find(blockedId)
      if (!blockedUser) {
        return response.redirect().back()
      }

      // Vérifie si le bloc existe déjà
      const existingBlock = await Block.query()
        .where('blocker_id', blocker.id)
        .andWhere('blocked_id', blockedId)
        .first()

      if (existingBlock) {
        await existingBlock.delete()
        console.log('Utilisateur débloqué')
      } else {
        await Block.create({ blockerId: blocker.id, blockedId })
        console.log('Utilisateur bloqué')
      }

      // ✅ Redirection vers la page profil du user bloqué/débloqué
      return response.redirect().toRoute('profile.show', { id: blockedId })
    } catch (error) {
      console.error('Erreur toggle block:', error)
      // En cas d’erreur, retour à la page précédente
      return response.redirect().back()
    }
  }
}
