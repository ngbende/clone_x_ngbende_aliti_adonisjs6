import type { HttpContext } from '@adonisjs/core/http'
import { createTweetValidator } from '#validators/tweet'
import Tweet from '#models/tweet'
import Media from '#models/media'

// import User from '#models/user'
import { promises as fs } from 'node:fs'

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
        const fileBuffer = await fs.readFile(imageFile.tmpPath)
        const base64Data = fileBuffer.toString('base64')

        await Media.create({
          type: 'image',
          url: base64Data,
          tweetId: tweet.id,
        })
      }

      if (videoFile && videoFile.tmpPath) {
        const fileBuffer = await fs.readFile(videoFile.tmpPath)
        const base64Data = fileBuffer.toString('base64')

        await Media.create({
          type: 'video',
          url: base64Data,
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
          repliesQuery.preload('user')
        })
        .first()

      if (!tweet) {
        return response.notFound('Tweet introuvable')
      }

      return view.render('pages/reply', { tweet })
    } catch (error) {
      console.error('Erreur affichage thread :', error)
      return response.status(500).send('Erreur serveur')
    }
  }

  public async reply({ request, auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Non authentifié')

    const parentId = params.id
    const content = request.input('content')

    // Création de la réponse
    await Tweet.create({
      content,
      userId: user.id,
      parentId: parentId, // on lie la réponse au parent
    })

    return response.redirect().back() // retour sur la page où on était
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
