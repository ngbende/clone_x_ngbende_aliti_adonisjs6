import type { HttpContext } from '@adonisjs/core/http'
import GrokService from '#services/grok_service'
import GrokSuggestion from '#models/grok_suggestion'

export default class GrokController {
  // ➕ Génération automatique de texte
  public async generateTweet({ auth, request, response }: HttpContext) {
    const prompt = request.input('prompt')

    const content = await GrokService.ask(
      `Génère un tweet court et percutant sur le thème : ${prompt}`
    )

    await GrokSuggestion.create({
      userId: auth.user!.id,
      generatedContent: content,
      suggestedHashtags: '',
      statistics: null,
    })

    return response.json({ content })
  }

  // ➕ Suggestions de hashtags
  public async suggestHashtags({ auth, request, response }: HttpContext) {
    const text = request.input('text')

    const suggestion = await GrokService.ask(
      `Propose 3 hashtags pertinents pour ce tweet : "${text}"`
    )

    await GrokSuggestion.create({
      userId: auth.user!.id,
      generatedContent: '',
      suggestedHashtags: suggestion,
      statistics: null,
    })

    return response.json({ hashtags: suggestion })
  }

  // ➕ Analyse de tweet (Grok)
  public async analyzeTweet({ auth, request, response }: HttpContext) {
    const text = request.input('text')

    const analysis = await GrokService.ask(
      `Analyse ce tweet et donne-moi :
      1. Le ton (positif, neutre ou négatif)
      2. Des conseils pour l'améliorer
      3. Une estimation du potentiel d'engagement (faible, moyen, fort)
      
      Tweet : "${text}"`
    )

    await GrokSuggestion.create({
      userId: auth.user!.id,
      generatedContent: '',
      suggestedHashtags: '',
      statistics: { analysis },
    })

    return response.json({ analysis })
  }
}
