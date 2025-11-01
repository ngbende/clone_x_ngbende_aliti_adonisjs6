import type { HttpContext } from '@adonisjs/core/http'
import Hashtag from '#models/hashtag'

export default class HashtagsController {
  public async showHashtags({ params, view, response }: HttpContext) {
    try {
      const texteHashtag = params.tag.toLowerCase()

      const hashtag = await Hashtag.query()
        .where('texteHashtag', texteHashtag)
        .preload('tweets', (query) => {
          query.preload('user').preload('medias').preload('hashtags') // précharge les hashtags
        })
        .firstOrFail()

      return view.render('pages/hashtag', { hashtag, tweets: hashtag.tweets })
    } catch (error) {
      console.error(error)
      return response.status(404).send('Hashtag introuvable')
    }
  }
}
