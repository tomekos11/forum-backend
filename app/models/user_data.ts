import { DateTime } from 'luxon'
import { afterFetch, afterFind, BaseModel, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import UserService from '#services/user_service'

export default class UserData extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare bio: null | string

  @column()
  declare description: null | string

  @column()
  declare image: null | string

  @column.dateTime({ autoCreate: true })
  declare lastActivity: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @computed()
  public get stats() {
    return this.$extras.stats || { posts: null, repPlus: null, repMinus: null }
  }

  @afterFetch()
  public static async afterFetchHook(userDataList: UserData[]) {
    for (const userData of userDataList) {
      userData.$extras.stats = await UserService.getUserStats(userData.id)
    }
  }

  @afterFind()
  public static async afterFindHook(userData: UserData) {
    userData.$extras.stats = await UserService.getUserStats(userData.id)
  }
}
