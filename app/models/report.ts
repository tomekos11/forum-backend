import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Post from './post.js'
import Topic from './topic.js'

export default class Report extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reporterId: number

  @column()
  declare reportableType: string | null

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

  public async reportable() {
    switch (this.reportableType) {
      case 'Post':
        return await Post.find(this.reportableId)
      case 'User':
        return await User.find(this.reportableId)
      case 'Topic':
        return await Topic.find(this.reportableId)
      default:
        return null // other, no relation
    }
  }
}
