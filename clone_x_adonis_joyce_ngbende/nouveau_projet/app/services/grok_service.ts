import Env from '#start/env'
import axios from 'axios'

export default class GrokService {
  private static apiUrl = 'https://api.mistral.ai/v1/chat/completions'
  private static apiKey = Env.get('MISTRAL_API_KEY')

  static async ask(prompt: string) {
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
      return response.data.choices[0].message.content
    } catch (error) {
      console.error('Erreur IA:', error.response?.data || error.message)
      return '❌ Erreur : impossible de contacter Grok.'
    }
  }
}
