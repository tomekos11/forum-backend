import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Report from './report.js'

export default class ReportMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reportId: number

  @column()
  declare userId: number

  @column()
  declare message: string

  @column({ serialize: Boolean })
  declare fromModerator: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: false, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Report)
  declare report: BelongsTo<typeof Report>
}
