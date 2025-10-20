import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Tweet from '#models/tweet'
import Like from '#models/like'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Retweet from './retweet.js'
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static email(email: any) {
    throw new Error('Method not implemented.')
  }
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nom: string | null

  @column()
  declare prenom: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column({ serializeAs: 'telephone' })
  declare telephone: string

  @column()
  declare bio: string | null

  @column()
  declare location: string | null

  @column()
  declare website: string | null

  @column({ serializeAs: 'isPrivate' })
  declare isPrivate: boolean

  @column({ serializeAs: 'photoProfil' })
  declare photoProfil: string | null

  @column({ serializeAs: 'coverPicture' })
  declare coverPicture: string | null

  @column({ serializeAs: 'verified' })
  declare verified: boolean

  @column({ columnName: 'verificationToken' })
  declare verificationToken: string | null

  @hasMany(() => Tweet)
  declare tweets: HasMany<typeof Tweet>

  @hasMany(() => Retweet)
  declare Retweet: HasMany<typeof Retweet>

  @hasMany(() => Like)
  declare likes: HasMany<typeof Like>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
