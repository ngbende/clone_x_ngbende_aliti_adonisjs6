import Follow from '#models/follow'
import FollowRequest from '#models/follow_request'
import User from '#models/user'

export default class CheckPrivateAccount {
  public async handle({ auth, params, view, response }: any, next: () => Promise<void>) {
    const user = auth.user!
    const cibleId = Number(params.id)
    const cible = await User.find(cibleId)

    if (!cible) {
      return response.notFound('Utilisateur introuvable.')
    }

    // Si compte privé et pas le même utilisateur
    if (cible.isPrivate && cible.id !== user.id) {
      // Vérifier si user suit déjà cible
      const follow = await Follow.query()
        .where('follower_id', user.id)
        .andWhere('followed_id', cible.id)
        .first()

      const request = await FollowRequest.query()
        .where('demandeur_id', user.id)
        .andWhere('cible_id', cible.id)
        .first()

      // Déterminer le statut
      let followStatus: 'none' | 'pending' | 'accepted' = 'none'
      if (follow) followStatus = 'accepted'
      else if (request) followStatus = 'pending'

      // Si le follow existe ou la demande a été acceptée, on laisse passer
      if (followStatus === 'accepted') {
        return await next()
      }

      // Sinon, on bloque et on affiche la page compte privé
      const html = await view.render('pages/privateAccount', {
        cible,
        followStatus,
        canRequestFollow: followStatus === 'none' || followStatus === 'pending',
      })
      return response.send(html)
    }

    await next()
  }
}
