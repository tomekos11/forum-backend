import Ban from '#models/ban'
import { DateTime } from 'luxon'

export default class BanService {
  static async checkIfBanned(userId: number) {
    const activeBan = await Ban.query()
      .where('user_id', userId)
      .andWhere((query) => {
        query.whereNull('banned_until').orWhere('banned_until', '>', DateTime.now().toSQL())
      })
      .first()

    if (activeBan) {
      return { status: 'banned', unlockDate: activeBan.bannedUntil, reason: activeBan.reason }
    }

    return null
  }
}
