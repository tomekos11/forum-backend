import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
  hasMany,
  computed,
  beforeSave,
  hasOne,
  manyToMany,
} from '@adonisjs/lucid/orm'
import Forum from './forum.js'
import type { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import Post from './post.js'
import slugify from 'slugify'
import User from './user.js'

export default class Topic extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare forumId: number | null // Może być null, jeśli użytkownik zostanie usunięty

  @column()
  declare userId: number | null

  @column({ serialize: Boolean })
  declare isPrimary: boolean

  @column({ serialize: Boolean })
  declare isClosed: boolean

  @column()
  declare pinnedPostId: number | null

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

  @belongsTo(() => Post, {
    foreignKey: 'pinnedPostId',
  })
  declare pinnedPost: BelongsTo<typeof Post>

  @manyToMany(() => User, {
    pivotTable: 'topic_user_follows',
  })
  public followers!: ManyToMany<typeof User>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeSave()
  public static async generateSlug(topic: Topic) {
    if (topic.$dirty.name) {
      let baseSlug = slugify(topic.name, { lower: true, strict: true })
      let slug = baseSlug
      let exists = await Topic.query().where('slug', slug).first()

      // Jeśli to edycja istniejącego topicu i slug się nie zmienia — przepuść
      if (exists && exists.id === topic.id) return

      // Dodawaj losowe cyfry, aż znajdziesz unikalny slug
      while (exists) {
        const randomNumber = Math.floor(1000 + Math.random() * 9000)
        slug = `${baseSlug}-${randomNumber}`
        exists = await Topic.query().where('slug', slug).first()
      }

      topic.slug = slug
    }
  }
}
