import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class FollowRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare demandeurId: number

  @column()
  declare cibleId: number

  @column()
  declare statut: 'en_attente' | 'acceptee' | 'refusee'

  @belongsTo(() => User, { foreignKey: 'demandeurId' })
  declare demandeur: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'cibleId' })
  declare cible: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
