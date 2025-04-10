import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, computed, hasMany } from '@adonisjs/lucid/orm'
import Topic from './topic.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import slugify from 'slugify'

export default class Forum extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

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

  @computed()
  public get postCounter() {
    return this.$extras.postCounter || 0
  }

  @hasMany(() => Topic)
  declare topics: HasMany<typeof Topic>

  @beforeSave()
  public static async generateSlug(forum: Forum) {
    if (forum.$dirty.name) {
      forum.slug = slugify(forum.name, { lower: true, strict: true })
    }
  }
}
