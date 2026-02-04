import Env from '#start/env'
import axios from 'axios'

export default class GrokService {
  private static apiUrl = 'https://api.mistral.ai/v1/chat/completions'
  private static apiKey = Env.get('MISTRAL_API_KEY')

  static async ask(prompt: string) {
    console.log('💡 Prompt envoyé à Grok :', prompt)
    console.log('🔑 Clé API utilisée :', this.apiKey)

    if (!this.apiKey) {
      console.error('❌ La clé MISTRAL_API_KEY est introuvable !')
      return '❌ Erreur : clé API manquante.'
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'mistral-small-latest',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )
      console.log('✅ Réponse brute de Grok :', response.data)
      return response.data.choices[0].message.content
    } catch (error: any) {
      console.error('Erreur IA:', error.response?.data || error.message)
      return '❌ Erreur : impossible de contacter Grok.'
    }
  }
}
