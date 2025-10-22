import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Tweet from './tweet.js'

export default class GrokSuggestion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare tweetId: number

  @column()
  declare userId: number

  @column()
  declare generatedContent: string

  @column()
  declare suggestedHashtags: string

  @column()
  declare statistics: object | null

  @belongsTo(() => Tweet)
  declare tweet: BelongsTo<typeof Tweet>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
