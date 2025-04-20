import UserActive from '#events/user_active'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RegisterUserActivityMiddleware {
  async handle({ auth }: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const user = auth.use('jwt').user
    if (user) {
      setImmediate(async () => {
        UserActive.dispatch(user)
      })
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
