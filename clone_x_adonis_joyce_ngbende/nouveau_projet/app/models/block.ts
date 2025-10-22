import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Block extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare blockerId: number

  @column()
  declare blockedId: number

  @belongsTo(() => User, { foreignKey: 'blockerId' })
  declare blocker: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'blockedId' })
  declare blocked: BelongsTo<typeof User> | undefined

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
