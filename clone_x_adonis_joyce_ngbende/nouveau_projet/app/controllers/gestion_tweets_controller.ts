import type { HttpContext } from '@adonisjs/core/http'
import { createTweetValidator } from '#validators/tweet'
import Tweet from '#models/tweet'
import Media from '#models/media'

// import User from '#models/user'
// import { promises as fs } from 'node:fs'
import Hashtag from '#models/hashtag'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'

export default class GestionTweetsController {
  public async createTweets({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized('Utilisateur non authentifié')
      }
     
      // 1️⃣ Valider le contenu du tweet
      const { inputTweet } = await request.validateUsing(createTweetValidator)

      if (!inputTweet || inputTweet.trim() === '') {
        return response.status(422).send('Le contenu du tweet est requis')
      }

      // 2️⃣ Créer le tweet en DB
      const tweet = await Tweet.create({
        content: inputTweet,
        userId: user.id,
      })

      // Extraction des hashtags (#mot)
      const hashtags = (inputTweet.match(/#\w+/g) || []).map((tag) => tag.toLowerCase())

      if (hashtags.length) {
        for (const tag of hashtags) {
          const texteHashtag = tag.replace('#', '')
          const hashtag = await Hashtag.firstOrCreate({ texteHashtag }, { texteHashtag })
          await tweet.related('hashtags').sync([hashtag.id], false)
        }
      }

      // 3️⃣ Récupérer les fichiers envoyés
      const imageFile = request.file('image', {
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg', 'gif'],
      })

      const videoFile = request.file('video', {
        size: '20mb',
        extnames: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv'],
      })

      // 4️⃣ Stocker les médias en Base64
      if (imageFile && imageFile.tmpPath) {
        const fileName = `${cuid()}.${imageFile.extname}`
        const filePath = `uploads/${fileName}`
        await imageFile.move(app.publicPath('uploads'), {
          name: fileName,
        })
        await Media.create({
          type: 'image',
          url: filePath,
          tweetId: tweet.id,
        })
      }

      if (videoFile && videoFile.tmpPath) {
          const fileName = `${cuid()}.${videoFile.extname}`
        const filePath = `uploads/${fileName}`
        await videoFile.move(app.publicPath('uploads'), {
          name: fileName,
        })

        await Media.create({
          type: 'video',
          url: filePath,
          tweetId: tweet.id,
        })
      }

      // 5️⃣ Rediriger vers la timeline
      return response.redirect().toRoute('home.index')
    } catch (error) {
      console.error('Erreur lors de la création du tweet :', error)
      return response.status(500).send('Erreur serveur lors de la création du tweet.')
    }
  }
  public async show({ params, view, response }: HttpContext) {
    try {
      const tweetId = params.id

      // Charger le tweet avec son user + ses replies + leurs users
      const tweet = await Tweet.query()
        .where('id', tweetId)
        .preload('user')
        .preload('medias')
        .preload('likes')
        .preload('retweets')
        .preload('replies', (repliesQuery) => {
          repliesQuery.preload('user').preload('medias') 
          .preload('hashtags') 
          .preload('likes')
          .preload('retweets')
        })
        .first()

      if (!tweet) {
        return response.notFound('Tweet introuvable')
      }
      console.log('Tweet data:', {
  id: tweet.id,
  content: tweet.content,
  repliesCount: tweet.replies?.length,
  replies: tweet.replies?.map(r => ({
    id: r.id,
    content: r.content,
    hasUser: !!r.user,
    userName: r.user?.nom,
    mediasCount: r.medias?.length
  }))
})

      return view.render('pages/reply', { tweet })
    } catch (error) {
      console.error('Erreur affichage thread :', error)
      return response.status(500).send('Erreur serveur')
    }
  }
public async reply({ request, auth, params, response }: HttpContext) {
  try {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Non authentifié')
    }

    const parentId = params.id
    const content = request.input('content')

    if (!content || content.trim() === '') {
      return response.status(422).send('Le contenu de la réponse est requis')
    }

    // 1️⃣ Créer le tweet réponse
    const tweet = await Tweet.create({
      content,
      userId: user.id,
      parentId: parentId,
    })

    // 2️⃣ Gestion des hashtags
    const hashtags = (content.match(/#\w+/g) || []).map((tag) => tag.toLowerCase())
    for (const tag of hashtags) {
      const texteHashtag = tag.replace('#', '')
      const hashtag = await Hashtag.firstOrCreate({ texteHashtag }, { texteHashtag })
      await tweet.related('hashtags').sync([hashtag.id], false)
    }

    // 3️⃣ Gestion des fichiers média
    const imageFile = request.file('image', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'gif'],
    })

    const videoFile = request.file('video', {
      size: '20mb',
      extnames: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv'],
    })

    if (imageFile && imageFile.tmpPath) {
      const fileName = `${cuid()}.${imageFile.extname}`
      const filePath = `uploads/${fileName}`
      await imageFile.move(app.publicPath('uploads'), { name: fileName })
      await Media.create({
        type: 'image',
        url: filePath,
        tweetId: tweet.id,
      })
    }

    if (videoFile && videoFile.tmpPath) {
      const fileName = `${cuid()}.${videoFile.extname}`
      const filePath = `uploads/${fileName}`
      await videoFile.move(app.publicPath('uploads'), { name: fileName })
      await Media.create({
        type: 'video',
        url: filePath,
        tweetId: tweet.id,
      })
    }

    // 4️⃣ Rediriger vers la page précédente
    return response.redirect().toRoute('home.index')

  } catch (error) {
    console.error('Erreur lors de la réponse :', error)
    return response.status(500).send('Une erreur est survenue lors de l’envoi de la réponse.')
  }
}


  public async deleteTweet({ response, auth, params }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const tweet = await Tweet.findOrFail(params.id)

    if (tweet.userId !== auth.user.id) {
      return response.unauthorized('Vous n’êtes pas autorisé à supprimer ce tweet')
    }

    await tweet.delete()
    return response.redirect().toRoute('home.index') // ou la route de la timeline
  }
}
