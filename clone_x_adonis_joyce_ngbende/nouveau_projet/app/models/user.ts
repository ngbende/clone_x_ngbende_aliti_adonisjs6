import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Tweet from '#models/tweet'
import Like from '#models/like'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Retweet from './retweet.js'
import GrokSuggestion from './grok_suggestion.js'
import Follow from './follow.js'
import Block from './block.js'
import FollowRequest from './follow_request.js'
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nom: string

  @column()
  declare prenom: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column({ serializeAs: 'telephone' })
  declare telephone: string | null

  @column()
  declare bio: string | null

  @column()
  declare location: string | null

  @column()
  declare website: string | null

  @column({ columnName: 'isPrivate' })
  declare isPrivate: boolean

  @column({ columnName: 'photoProfil' })
  declare photoProfil: string | null
  
  @column.date()
  declare date_naissance: DateTime | null

  
  @column({ columnName: 'coverPicture' })
  declare coverPicture: string | null

  @column({ serializeAs: 'verified' })
  declare verified: boolean

  @column({ columnName: 'verificationToken' })
  declare verificationToken: string | null

  @hasMany(() => Tweet)
  declare tweets: HasMany<typeof Tweet>

  // Dans User.ts - ajoute cette relation
@hasMany(() => Tweet, {
  foreignKey: 'userId',
  onQuery: (query) => {
    query.whereNotNull('parentId') // seulement les réponses
  }
})
declare replies: HasMany<typeof Tweet>

  @hasMany(() => Retweet)
  declare retweets: HasMany<typeof Retweet>

  @hasMany(() => Like)
  declare likes: HasMany<typeof Like>

  @hasMany(() => GrokSuggestion)
  declare grokSuggestions: HasMany<typeof GrokSuggestion>

  // Relations avec Follow (N-N entre utilisateurs)
  @hasMany(() => Follow, { foreignKey: 'followerId' })
  declare following: HasMany<typeof Follow> // utilisateurs que je suis

  @hasMany(() => Follow, { foreignKey: 'followedId' })
  declare followers: HasMany<typeof Follow> // utilisateurs qui me suivent

  // Relations avec Block
  @hasMany(() => Block, { foreignKey: 'blockerId' })
  declare blockedUsers: HasMany<typeof Block>

  public async isBlocking(userId: number): Promise<boolean> {
    const exists = await Block.query()
      .where('blocker_id', this.id)
      .andWhere('blocked_id', userId)
      .first()
    return !!exists
  }

  public async isBlockedBy(userId: number): Promise<boolean> {
    const exists = await Block.query()
      .where('blocker_id', userId)
      .andWhere('blocked_id', this.id)
      .first()
    return !!exists
  }
  @hasMany(() => FollowRequest, { foreignKey: 'demandeur_id' })
  declare sentFollowRequests: HasMany<typeof FollowRequest>

  @hasMany(() => FollowRequest, { foreignKey: 'cible_id' })
  declare receivedFollowRequests: HasMany<typeof FollowRequest>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
