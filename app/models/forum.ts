import { DateTime } from 'luxon'
import { BaseModel, column, computed, hasMany } from '@adonisjs/lucid/orm'
import Topic from './topic.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Forum extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  public get latestPost() {
    return this.$extras.latestPost || null
  }

  @hasMany(() => Topic)
  declare topics: HasMany<typeof Topic>
}
