import Ban from '#models/ban'
import { banUserValidator } from '#validators/ban'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class BansController {
  public async banUser({ request, response }: HttpContext) {
    const { userId, duration, reason } = await banUserValidator.validate(
      request.only(['userId', 'duration', 'reason'])
    )
    const activeBan = await Ban.query()
      .where('user_id', userId)
      .andWhere((query) => {
        query.whereNull('banned_until').orWhere('banned_until', '>', DateTime.now().toSQL())
      })
      .first()

    if (activeBan) {
      return response.badRequest({ message: 'Użytkownik już ma aktywnego bana' })
    }

    let bannedUntilDate: DateTime | null = null

    if (duration === 'forever') {
      bannedUntilDate = null
    } else {
      const match = duration.match(/^(\d+)([dmy])$/)
      if (!match) {
        return response.badRequest({
          message: 'Niepoprawna wartość pola duration (np. 7d, 1m, 2y)',
        })
      }

      const amount = Number.parseInt(match[1], 10)
      const unit = match[2] as 'd' | 'm' | 'y'

      const now = DateTime.now()
      if (unit === 'd') bannedUntilDate = now.plus({ days: amount })
      else if (unit === 'm') bannedUntilDate = now.plus({ months: amount })
      else if (unit === 'y') bannedUntilDate = now.plus({ years: amount })
    }

    const ban = await Ban.create({
      userId,
      bannedUntil: bannedUntilDate,
      reason,
    })

    return response.ok({ ban })
  }

  public async unbanUser({ params, response }: HttpContext) {
    const userId = params.id

    const activeBan = await Ban.query()
      .where('user_id', userId)
      .andWhere((query) => {
        query.whereNull('banned_until').orWhere('banned_until', '>', DateTime.now().toSQL())
      })
      .first()

    if (!activeBan) {
      return response.notFound({ message: 'Użytkownik nie jest zbanowany' })
    }

    await activeBan.delete()

    return response.ok({ message: 'Użytkownik został odbanowany' })
  }

  /**
   * Lista zbanowanych użytkowników (aktywnych banów)
   */
  public async listActiveBans({ response }: HttpContext) {
    const activeBans = await Ban.query()
      .where((query) => {
        query.whereNull('banned_until').orWhere('banned_until', '>', DateTime.now().toSQL())
      })
      .preload('user', (userQuery) => userQuery.preload('data'))

    return response.ok(activeBans)
  }

  /**
   * Szczegóły banów konkretnego użytkownika
   */
  public async userBans({ params, response }: HttpContext) {
    const userId = params.id

    const bans = await Ban.query().where('user_id', userId).orderBy('created_at', 'desc')

    return response.ok(bans)
  }
}
