import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Tweet from './tweet.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Hashtag extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'texteHashtag' })
  declare texteHashtag: string

  @manyToMany(() => Tweet, {
    pivotTable: 'tweet_hashtags',
    pivotTimestamps: true, // pour enregistrer created_at et updated_at dans la table pivot
  })
  declare tweets: ManyToMany<typeof Tweet>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
