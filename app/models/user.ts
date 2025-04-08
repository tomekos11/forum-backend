import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { afterCreate, BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Post from './post.js'
import UserData from './user_data.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column({ serializeAs: null }) // Hasło nie będzie zwracane w API
  declare password: string

  @column()
  declare role: 'user' | 'marketing' | 'moderator' | 'admin' // Ograniczenie do wartości z migracji

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Post)
  declare posts: HasMany<typeof Post> // Relacja 1:N – użytkownik może mieć wiele postów

  @hasOne(() => UserData)
  declare data: HasOne<typeof UserData>

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @afterCreate()
  public static async createUserData(user: User) {
    await UserData.create({
      userId: user.id,
    })
  }
}
