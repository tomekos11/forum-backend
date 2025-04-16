import type { HttpContext } from '@adonisjs/core/http'
import { createUserValidator } from '#validators/user'

import User from '#models/user'
import redis from '@adonisjs/redis/services/main'
import Notification from '#models/notification'
import Post from '#models/post'

export default class AuthController {
  public async login({ request, auth, response }: HttpContext) {
    const { username, password } = request.only(['username', 'password'])

    try {
      const user = await User.verifyCredentials(username, password)
      await auth.use('jwt').generate(user)

      await user.load('data')
      return user
    } catch (error) {
      return response.unauthorized({ error: 'Nieprawidłowe dane logowania' })
    }
  }

  public async logout({ auth, response }: HttpContext) {
    try {
      const user = await auth.use('jwt').authenticate()
      await redis.del(`user:online:${user.id}`)

      response.clearCookie('token')

      return { message: 'Wylogowano' }
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error)
      return { message: 'Błąd wylogowania, spróbuj ponownie' }
    }
  }

  public async register({ request, auth, response }: HttpContext) {
    const { username, password } = request.only(['username', 'password'])

    try {
      await createUserValidator.validate({ username, password })

      const existingUser = await User.findBy('username', username)
      if (existingUser) {
        return response.badRequest({ error: 'Użytkownik o tej nazwie już istnieje' })
      }

      const user = await User.create({ username, password })
      await auth.use('jwt').generate(user)
      await user.load('data')

      return user
    } catch (error) {
      return response.badRequest({ error: 'Nie można zarejestrować użytkownika', err: error })
    }
  }

  public async checkUser({ auth, response }: HttpContext) {
    try {
      const user = await auth.use('jwt').authenticate()
      await user.load('data')

      const unreadNotifications = await Notification.query()
        .where('user_id', user.id)
        .where('read', false)
        .groupBy('topic_id')
        .select('*')
        .count('* as total')
        .preload('topic', (topicQuery) => {
          topicQuery.preload('forum')
        })
      const mapped = await Promise.all(
        unreadNotifications.map(async (row) => {
          const topicId = row.topicId
          const postId = row.postId

          const postPosition = await Post.query()
            .where('topic_id', topicId)
            .where('id', '<=', postId)
            .count('* as count')

          const count = Number(postPosition[0].$extras.count)
          const page = Math.ceil(count / 10)

          return {
            topicSlug: row.topic.slug,
            forumSlug: row.topic.forum.slug,
            count: Number.parseInt(row.$extras.total),
            page,
            perPage: 10,
          }
        })
      )
      //TODO dodac przekierowanie na topic k - topic + page
      //TODO TESTY
      return response.ok({ user, notifications: mapped })
    } catch (error) {
      return response.unauthorized({ message: 'Unauthorized, invalid token or no token provided' })
    }
  }

  public async online({ auth, response }: HttpContext) {
    try {
      const onlineUsers = await redis.keys('user:online:*')
      const onlineGuests = await redis.keys('guest:online:*')

      const activeUsersCount = onlineUsers.length
      const activeGuestsCount = onlineGuests.length

      return response.ok({
        activeUsersCount,
        activeGuestsCount,
        totalActiveUsers: activeUsersCount + activeGuestsCount,
      })
    } catch (error) {
      return response.ok({
        activeUsersCount: 0,
        activeGuestsCount: 0,
        totalActiveUsers: 0,
      })
    }
  }
}
