import BanService from '#services/ban_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class CheckIfBannedMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    const user = auth.use('jwt').user

    if (user) {
      const banResponse = await BanService.checkIfBanned(user.id)

      if (banResponse) {
        response.clearCookie('token')

        return response.unauthorized(banResponse)
      }
    }

    await next()
  }
}
