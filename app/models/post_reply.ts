import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Post from './post.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class PostReply extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare postId: number // Post, który jest cytowany

  @column()
  declare replyId: number // Post, który cytuje

  @belongsTo(() => Post, {
    foreignKey: 'postId',
  })
  declare quotedPost: BelongsTo<typeof Post>

  @belongsTo(() => Post, {
    foreignKey: 'replyId',
  })
  declare quotingPost: BelongsTo<typeof Post>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  public page?: number
  public perPage?: number
  public rowNumber?: number
}
