import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Ban extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare bannedBy: number | null

  @column()
  declare reason: string

  @column({
    prepare: (value: object | null) => {
      return JSON.stringify(value)
    },
    consume: (value: string | null) => {
      return value ? JSON.parse(value) : value
    },
  })
  declare comment: object | null

  @column.dateTime()
  declare bannedUntil: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'bannedBy' })
  declare bannedByUser: BelongsTo<typeof User>
}
