import type { HttpContext } from '@adonisjs/core/http'
import Hashtag from '#models/hashtag'

export default class HashtagsController {
  public async showHashtags({ params, view, response }: HttpContext) {
    try {
      const texteHashtag = params.tag.toLowerCase()

         const hashtag = await Hashtag.query()
        .where('texteHashtag', texteHashtag)
        .preload('tweets', (query) => {
          query
            .preload('user')
            .preload('medias')
            .preload('hashtags')
            .preload('likes')      // ✅ AJOUTEZ
            .preload('retweets')   // ✅ AJOUTEZ
            .preload('replies', (repliesQuery) => {
              repliesQuery
                .preload('user')
                .preload('medias')
                .preload('likes')    // ✅ AJOUTEZ pour les replies
                .preload('retweets') // ✅ AJOUTEZ pour les replies
            })
        })
        .firstOrFail()

      return view.render('pages/hashtag', { hashtag, tweets: hashtag.tweets })
    } catch (error) {
      console.error(error)
      return response.status(404).send('Hashtag introuvable')
    }
  }
}
