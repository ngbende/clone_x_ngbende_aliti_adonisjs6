import type { HttpContext } from '@adonisjs/core/http'
import FollowRequest from '#models/follow_request'
import Follow from '#models/follow'
import User from '#models/user'

export default class FollowRequestsController {
  // Toggle follow / demande de suivi

  public async toggle({ auth, params, response, session }: HttpContext) {
    const user = auth.user!
    const cibleId = Number(params.id)

    if (user.id === cibleId) {
      session.flash('danger', 'Vous ne pouvez pas vous suivre vous-même.')
      return response.redirect().back()
    }

    const cible = await User.find(cibleId)
    if (!cible) {
      session.flash('danger', 'Utilisateur introuvable.')
      return response.redirect().back()
    }

    const existingFollow = await Follow.query()
      .where('follower_id', user.id)
      .andWhere('followed_id', cible.id)
      .first()

    if (existingFollow) {
      await existingFollow.delete()
      session.flash('success', 'Vous ne suivez plus cet utilisateur.')
      return response.redirect().back()
      // return response.redirect().toRoute('show.login')
    }

    if (!cible.isPrivate) {
      await Follow.create({ followerId: user.id, followedId: cible.id })
      session.flash('success', 'Utilisateur suivi avec succès.')
      return response.redirect().back()
    }

    const existingRequest = await FollowRequest.query()
      .where('demandeur_id', user.id)
      .andWhere('cible_id', cible.id)
      .first()

    if (existingRequest) {
      await existingRequest.delete()
      session.flash('warning', 'Demande de suivi annulée.')
      return response.redirect().back()
    }

    await FollowRequest.create({
      demandeurId: user.id,
      cibleId: cible.id,
      statut: 'en_attente',
    })

    session.flash('success', 'Demande de suivi envoyée.')
    return response.redirect().back()
  }

  //  Accepter une demande de suivi

  public async accept({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const requestId = Number(params.id)

    const request = await FollowRequest.find(requestId)
    if (!request || request.cibleId !== user.id) {
      return response.unauthorized({ message: 'Accès refusé.' })
    }

    request.statut = 'acceptee'
    await request.save()

    await Follow.firstOrCreate({
      followerId: request.demandeurId,
      followedId: user.id,
    })

    return response.redirect().back()
  }

  //  Refuser une demande

  public async reject({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const requestId = Number(params.id)

    const request = await FollowRequest.find(requestId)
    if (!request || request.cibleId !== user.id) {
      return response.unauthorized({ message: 'Accès refusé.' })
    }

    request.statut = 'refusee'
    await request.save()

    return response.ok({ message: 'Demande de suivi refusée.' })
  }

  //  Voir mes demandes reçues (optionnel)

  public async received({ auth, view }: HttpContext) {
    const user = auth.user!

    const demandes = await FollowRequest.query()
      .where('cible_id', user.id)
      .andWhere('statut', 'en_attente')
      .preload('demandeur')

    return view.render('pages/receiveFollows', { demandes })
  }
}
