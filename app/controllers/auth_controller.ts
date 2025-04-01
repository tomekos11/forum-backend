import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'

export default class AuthController {
  public async login({ request, auth, response }: HttpContext) {
    const { username, password } = request.only(['username', 'password'])

    try {
      const user = await User.verifyCredentials(username, password)
      await auth.use('jwt').generate(user)

      return { message: 'Zalogowano pomyślnie' }
    } catch (error) {
      return response.unauthorized({ error: 'Nieprawidłowe dane logowania' })
    }
  }

  public async register({ request, auth, response }: HttpContext) {
    const { username, password } = request.only(['username', 'password'])

    try {
      const user = await User.create({ username, password })
      await auth.use('jwt').generate(user)

      return response.created({ message: 'Zarejestrowano pomyślnie' })
    } catch (error) {
      return response.badRequest({ error: 'Nie można zarejestrować użytkownika', err: error })
    }
  }

  public async checkAdmin({ auth, response }: HttpContext) {
    await auth.use('jwt').authenticate()
    return response.ok({ isAdmin: auth.user?.role === 'admin' })
  }
}
