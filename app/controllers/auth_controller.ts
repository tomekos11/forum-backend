import type { HttpContext } from '@adonisjs/core/http'
import { createUserValidator } from '#validators/user'

import User from '#models/user'
import redis from '@adonisjs/redis/services/main'
import NotificationService from '#services/notification_service'
import BanService from '#services/ban_service'

export default class AuthController {
  public async login({ request, auth, response }: HttpContext) {
    const { username, password } = request.only(['username', 'password'])

    try {
      const user = await User.verifyCredentials(username, password)
      await auth.use('jwt').generate(user)

      if (user) {
        const banResponse = await BanService.checkIfBanned(user.id)
        if (banResponse) {
          response.clearCookie('token')
          return response.unauthorized(banResponse)
        }
      }
      await user.load('data')

      const unread = await NotificationService.getUnreadGroupedByTopic(user.id)

      return response.ok({ user, notifications: unread })
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

      const unread = await NotificationService.getUnreadGroupedByTopic(user.id)

      return response.ok({ user, notifications: unread })
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
