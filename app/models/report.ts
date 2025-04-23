import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Report extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reporterId: number

  @column()
  declare reportableType: string

  @column()
  declare reportableId: number

  @column()
  declare reason: string

  @column()
  declare status: 'pending' | 'in_progress' | 'resolved'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: false, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, {
    foreignKey: 'reporterId',
  })
  declare reporter: BelongsTo<typeof User>
}
