import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import redis from '@adonisjs/redis/services/main'

export default class OnlineTrackerMiddleware {
  async handle({ auth, request }: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    let userId: string | undefined

    try {
      const user = await auth.use('jwt').authenticate()
      userId = user.id.toString()

      try {
        await redis.setex(`user:online:${userId}`, 60 * 5, '1')
      } catch (redisError) {
        console.error('Błąd przy zapisywaniu do Redis dla użytkownika:', redisError)
      }
    } catch (error) {
      const sessionId = request.ip()
      userId = sessionId

      try {
        await redis.setex(`guest:online:${userId}`, 60 * 5, '1')
      } catch (redisError) {
        console.error('Błąd przy zapisywaniu do Redis dla gościa:', redisError)
      }
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
