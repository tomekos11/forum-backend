import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import { Hash } from '@adonisjs/core/hash'

export default class AuthController {
  public async login({ request, auth, response }: HttpContext) {
    const { username, password } = request.only(['username', 'password'])
    const user = await User.findBy('username', username)

    if (!user || !(await Hash.verify(user.password, password))) {
      return response.unauthorized({ error: 'Nieprawidłowe dane logowania' })
    }

    const token = await auth.use('api').generate(user)
    return { message: 'Zalogowano pomyślnie', token }
  }

  public async checkAdmin({ auth, response }: HttpContext) {
    await auth.use('api').authenticate()
    return response.ok({ isAdmin: auth.user?.role === 'admin' })
  }
}
