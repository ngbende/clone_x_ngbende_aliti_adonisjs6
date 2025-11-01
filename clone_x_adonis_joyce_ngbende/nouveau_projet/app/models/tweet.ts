import { DateTime } from 'luxon'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { column, BaseModel, hasMany, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import Like from '#models/like'
import User from './user.js'
import Retweet from './retweet.js'
import Media from './media.js'
import Hashtag from './hashtag.js'
import GrokSuggestion from './grok_suggestion.js'

export default class Tweet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare content: string

  // Clé étrangère vers l'utilisateur qui a posté le tweet
  @column()
  declare userId: number

  // Clé étrangère optionnelle vers le tweet parent (si c'est une réponse)
  @column()
  declare parentId?: number | null

  // ✅ ajoute cette ligne :
  public contentClean?: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Tweet, { foreignKey: 'parentId' })
  declare parent: BelongsTo<typeof Tweet> // relation vers le tweet parent

  @hasMany(() => Tweet, { foreignKey: 'parentId' })
  declare replies: HasMany<typeof Tweet> // relation vers les réponses

  @hasMany(() => Like)
  declare likes: HasMany<typeof Like>

  @hasMany(() => Retweet)
  declare retweets: HasMany<typeof Retweet>

  @hasMany(() => Media)
  declare medias: HasMany<typeof Media>

  @manyToMany(() => Hashtag, {
    pivotTable: 'tweet_hashtags',
    pivotTimestamps: true, // pour enregistrer created_at et updated_at dans la table pivot
  })
  declare hashtags: ManyToMany<typeof Hashtag>

  @hasMany(() => GrokSuggestion)
  declare grokSuggestions: HasMany<typeof GrokSuggestion>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
