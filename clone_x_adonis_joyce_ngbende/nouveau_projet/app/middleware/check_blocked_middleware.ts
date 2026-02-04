import Block from '#models/block'
import type { HttpContext } from '@adonisjs/core/http'

export default class CheckBlockedMiddleware {
  public async handle({ auth, params, response, view }: HttpContext, next: () => Promise<void>) {
    // Si pas d'utilisateur authentifié, on laisse le middleware d'auth s'en charger avant
    const currentUserId = auth.user?.id
    const targetId = params.id

    // Si pas de param id ou pas d'utilisateur connecté => continuer
    if (!targetId || !currentUserId) {
      await next()
      return
    }

    // Vérifie si le user connecté est bloqué par la personne ciblée
    const isBlocked = await Block.query()
      .where('blocker_id', Number(targetId))
      .andWhere('blocked_id', currentUserId)
      .first()

    if (isBlocked) {
      // Génère le HTML via la view, puis renvoie le contenu avec le status 404
      const html = await view.render('pages/errors/not_founds', {
        message: 'Utilisateur introuvable ou inaccessible',
      })
      return response.status(404).send(html)
    }

    await next()
  }
}
