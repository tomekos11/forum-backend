import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, computed } from '@adonisjs/lucid/orm'
import Forum from './forum.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Post from './post.js'

export default class Topic extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare forumId: number | null // Może być null, jeśli użytkownik zostanie usunięty

  @column()
  declare isPrimary: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  public get postCounter() {
    return this.$extras.postCounter || 0
  }

  @belongsTo(() => Forum)
  declare forum: BelongsTo<typeof Forum>

  @hasMany(() => Post)
  declare posts: HasMany<typeof Post> // Relacja 1:N – użytkownik może mieć wiele postów
}
