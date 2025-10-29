import Tweet from '#models/tweet'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SearchesController {
  public async index({ request, view }: HttpContext) {
    try {
      // On récupère la query (ce que l'utilisateur tape) depuis l'URL ou le formulaire
      // Si rien n'est fourni, on met une chaîne vide et on fait un trim pour nettoyer les espaces
      const query = request.input('query', '').trim()

      // Si la query est vide, on retourne directement la page search avec des listes vides
      // Ça évite de lancer des requêtes inutiles sur la base de données
      if (!query) {
        return view.render('pages/search', {
          users: [], // Pas de résultats utilisateurs
          tweets: [], // Pas de résultats tweets
          query: '', // On renvoie la query vide pour ne pas planter le formulaire
        })
      }

      // Si une query existe, on fait une recherche dans les utilisateurs
      // On cherche dans le nom et le prénom avec un LIKE pour permettre une recherche partielle
      const users = await User.query()
        .where('nom', 'LIKE', `%${query}%`)
        .orWhere('prenom', 'LIKE', `%${query}%`)

      // Ensuite, on cherche aussi les tweets contenant le texte de la query
      // On preload l'utilisateur associé pour pouvoir afficher son nom/photo dans la vue

      const tweets = await Tweet.query().where('content', 'LIKE', `%${query}%`).preload('user')

      // Enfin, on rend la page de recherche avec les résultats trouvés
      // On renvoie aussi la query pour remplir le champ de recherche dans le formulaire
      return view.render('pages/search', {
        users,
        tweets,
        query,
      })
    } catch (error) {
      console.error('Erreur recherche :', error)
      // On renvoie quand même la page search, mais avec les résultats vides
      // et on ajoute un message d'erreur pour informer l'utilisateur
      return view.render('pages/search', {
        users: [],
        tweets: [],
        query: request.input('query', ''), // on essaye quand même de garder la query pour l'utilisateur
        error: 'Une erreur est survenue',
      })
    }
  }
}
