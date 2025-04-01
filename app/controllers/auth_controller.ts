import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'

export default class AuthController {
  public async login({ request, auth, response }: HttpContext) {
    const { username, password } = request.only(['username', 'password'])

    try {
      // Użycie metody verifyCredentials do sprawdzenia użytkownika i hasła
      const user = await User.verifyCredentials(username, password)

      // Generowanie tokena JWT przy użyciu login()
      await auth.use('jwt').generate(user)

      return { message: 'Zalogowano pomyślnie' }
    } catch (error) {
      return response.unauthorized({ error: 'Nieprawidłowe dane logowania' })
    }
  }

  public async checkAdmin({ auth, response }: HttpContext) {
    await auth.use('jwt').authenticate()
    return response.ok({ isAdmin: auth.user?.role === 'admin' })
  }
}
