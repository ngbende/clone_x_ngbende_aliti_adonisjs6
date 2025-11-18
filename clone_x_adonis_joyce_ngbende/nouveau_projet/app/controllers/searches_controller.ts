import Tweet from '#models/tweet'
import User from '#models/user'
import Follow from '#models/follow'
import SuggestionService from '#services/suggestion_service'
import type { HttpContext } from '@adonisjs/core/http'

// Fonctions d'aide pour normaliser les termes de recherche
// Elles permettent de rendre la recherche insensible à la casse et aux accents
function normalizeSearchTerm(term: string): string {
  return term
    .normalize('NFD') // Décompose les caractères accentués (é -> e + ´)
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques (accents)
    .toLowerCase() // Convertit en minuscules
    .trim() // Supprime les espaces inutiles
}

function buildSearchPattern(term: string): string {
  // Crée un pattern LIKE avec des wildcards (%) pour la recherche partielle
  return `%${normalizeSearchTerm(term)}%`
}

export default class SearchesController {
  public async index({ request, view, auth }: HttpContext) {
    try {
      // On récupère la query (ce que l'utilisateur tape) depuis l'URL ou le formulaire
      // Si rien n'est fourni, on met une chaîne vide et on fait un trim pour nettoyer les espaces
      const query = request.input('query', '').trim()

      // Si la query est vide, on retourne directement la page search avec des listes vides
      // Mais on ajoute les suggestions d'utilisateurs pour garder une page utile
      if (!query) {
        // On utilise le service de suggestions pour avoir des recommandations pertinentes
        const suggestions = await SuggestionService.getSuggestions(auth.user!.id)
        
        return view.render('pages/search', {
          users: [], // Pas de résultats utilisateurs
          tweets: [], // Pas de résultats tweets
          query: '', // On renvoie la query vide
          suggestions: suggestions // Mais on garde les suggestions pour l'UX
        })
      }

      // Si une query existe, on prépare le pattern de recherche normalisé
      // Ça permet de chercher "jérôme" et trouver "Jérôme", "Jerome", "JÉRÔME", etc.
      const searchPattern = buildSearchPattern(query)
      
      // Recherche avancée dans les utilisateurs : nom, prénom, email ET bio
      // On utilise LOWER() et LIKE pour une recherche insensible à la casse
      const users = await User.query()
        .where((builder) => {
          builder
            .whereRaw('LOWER(nom) LIKE ?', [searchPattern]) // Recherche dans le nom
            .orWhereRaw('LOWER(prenom) LIKE ?', [searchPattern]) // Recherche dans le prénom
            .orWhereRaw('LOWER(email) LIKE ?', [searchPattern]) // Recherche dans l'email
            .orWhereRaw('LOWER(bio) LIKE ?', [searchPattern]) // Recherche dans la bio
        })
        .whereNot('id', auth.user!.id) // Exclut l'utilisateur connecté des résultats

      // Pour chaque utilisateur trouvé, on vérifie le statut de follow
      // Ça permet d'afficher "Suivi" ou "Suivre" selon la relation
      const usersWithFollowStatus = await Promise.all(
        users.map(async (user) => {
          // On vérifie si l'utilisateur connecté suit déjà cet utilisateur
          const existingFollow = await Follow.query()
            .where('follower_id', auth.user!.id) // Celui qui suit
            .andWhere('followed_id', user.id) // Celui qui est suivi
            .first()

          // On retourne l'utilisateur avec son statut de follow
          return {
            ...user.toJSON(), // On garde toutes les infos de l'utilisateur
            followStatus: existingFollow ? 'followed' : 'none', // On ajoute le statut
          }
        })
      )

      // Recherche dans les tweets avec le même pattern normalisé
      // On preload toutes les relations nécessaires pour l'affichage
      const tweets = await Tweet.query()
        .whereRaw('LOWER(content) LIKE ?', [searchPattern]) // Recherche insensible casse
        .preload('user') // Auteur du tweet
        .preload('medias') // Images/vidéos
        .preload('likes') // Pour compter les likes
        .preload('retweets') // Pour compter les retweets
        .preload('hashtags') // Pour l'affichage des hashtags
        .orderBy('created_at', 'desc') // Les plus récents en premier

      // Transformation des hashtags en liens cliquables
      // Ça permet de cliquer sur un hashtag pour voir tous les tweets avec ce hashtag
      tweets.forEach((tweet) => {
        if (tweet.hashtags && tweet.hashtags.length > 0) {
          let content = tweet.content
          // Pour chaque hashtag trouvé dans le tweet, on le transforme en lien
          tweet.hashtags.forEach((h) => {
            const regex = new RegExp(`#${h.texteHashtag}`, 'gi') // Recherche insensible casse
            content = content.replace(
              regex,
              `<a href="/hashtag/${h.texteHashtag}" class="text-blue-400 hover:underline">#${h.texteHashtag}</a>`
            )
          })
          tweet.contentClean = content // On stocke la version avec les liens
        } else {
          tweet.contentClean = tweet.content // Pas de hashtags, on garde le contenu original
        }
      })

      // On utilise le service de suggestions pour avoir des recommandations pertinentes
      // Même pendant une recherche, on garde la sidebar utile
      const suggestions = await SuggestionService.getSuggestions(auth.user!.id)

      // Enfin, on rend la page de recherche avec tous les résultats trouvés
      return view.render('pages/search', {
        users: usersWithFollowStatus, // Utilisateurs avec statut de follow
        tweets, // Tweets avec hashtags transformés
        query, // La recherche originale pour le champ input
        suggestions: suggestions // Suggestions pour la sidebar
      })
    } catch (error) {
      console.error('Erreur recherche :', error)
      
      // En cas d'erreur, on essaie quand même d'avoir des suggestions
      // Pour ne pas casser complètement l'expérience utilisateur
      // On spécifie le type explicitement pour éviter l'erreur TypeScript
      let suggestions: any[] = []
      try {
        suggestions = await SuggestionService.getSuggestions(auth.user!.id)
      } catch (suggestionError) {
        console.error('Erreur suggestions de secours:', suggestionError)
      }

      // On renvoie quand même la page search, mais avec les résultats vides
      // et on ajoute un message d'erreur pour informer l'utilisateur
      return view.render('pages/search', {
        users: [],
        tweets: [],
        query: request.input('query', ''), // on essaye quand même de garder la query pour l'utilisateur
        suggestions: suggestions, // On garde les suggestions si possible
        error: 'Une erreur est survenue',
      })
    }
  }
}