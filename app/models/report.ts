import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Post from './post.js'
import Topic from './topic.js'
import ReportMessage from './report_message.js'

export default class Report extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reporterId: number

  @column()
  declare reportableType: string

  @column()
  declare reportableId: number | null

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

  @hasMany(() => ReportMessage)
  declare messages: HasMany<typeof ReportMessage>

  public async reportable() {
    switch (this.reportableType) {
      case 'Post':
        return await Post.query().where('id', this.reportableId!).preload('postHistories').first()
      case 'User':
        return await User.query().where('id', this.reportableId!).preload('data').first()
      case 'Topic':
        return await Topic.query()
          .where('id', this.reportableId!)
          .preload('posts', (postsQuery) => {
            postsQuery.limit(1)
          })
          .first()
      default:
        return null // other, brak danych
    }
  }
}
