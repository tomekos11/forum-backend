import Ban from '#models/ban'
import User from '#models/user'
import { banUserValidator, unbanValidator } from '#validators/ban'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class BansController {
  public async banUser({ auth, request, response }: HttpContext) {
    const currentUser = auth.use('jwt').user!

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
      bannedBy: currentUser.id,
      bannedUntil: bannedUntilDate,
      reason,
    })

    return response.ok({ ban })
  }

  public async unbanUser({ request, params, response }: HttpContext) {
    const username = params.username
    const user = await User.query().where('username', username).preload('data').firstOrFail()
    const { unbanReason } = await unbanValidator.validate(request.only(['unbanReason']))

    const activeBan = await Ban.query()
      .where('user_id', user.id)
      .andWhere((query) => {
        query.whereNull('banned_until').orWhere('banned_until', '>', DateTime.now().toSQL())
      })
      .first()

    if (!activeBan) {
      return response.notFound({ message: 'Użytkownik nie jest zbanowany' })
    }

    const unbanComment = {
      unbanUser: user.id,
      unbanDate: DateTime.now(),
      unbanReason: unbanReason,
      scheduledEnd: activeBan.bannedUntil,
    }
    activeBan.bannedUntil = DateTime.now()
    activeBan.comment = unbanComment
    await activeBan.save()

    return response.ok({ user, message: 'Użytkownik został odbanowany' })
  }

  public async listActiveBans({ response }: HttpContext) {
    const activeBans = await Ban.query()
      .where((query) => {
        query.whereNull('banned_until').orWhere('banned_until', '>', DateTime.now().toSQL())
      })
      .preload('user', (userQuery) => userQuery.preload('data'))

    return response.ok(activeBans)
  }

  public async userBans({ params, response }: HttpContext) {
    const username = params.username

    const user = await User.query().where('username', username).preload('data').firstOrFail()

    const bans = await Ban.query()
      .where('user_id', user.id)
      .preload('bannedByUser')
      .orderBy('created_at', 'desc')

    const enrichedBans = await Promise.all(
      bans.map(async (ban) => {
        const unbanUserId = (ban.comment as Record<string, any>)?.unbanUser
        console.log(unbanUserId)
        let unbanUser = null

        if (unbanUserId) {
          unbanUser = await User.query().where('id', unbanUserId).first()
        }

        return {
          ...ban.serialize(),
          unbanUser,
        }
      })
    )

    return response.ok({ user, bans: enrichedBans })
  }
}
