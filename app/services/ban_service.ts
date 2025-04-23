import Ban from '#models/ban'
import { DateTime } from 'luxon'

export default class BanService {
  static async isUserBanned(userId: number) {
    const activeBan = await Ban.query()
      .where('user_id', userId)
      .andWhere((query) => {
        query.whereNull('banned_until').orWhere('banned_until', '>', DateTime.now().toSQL())
      })
      .first()

    return activeBan
  }

  static async advancedInfoAboutBan(userId: number) {
    const activeBan = await this.isUserBanned(userId)

    if (activeBan) {
      return { isBanned: true, ...activeBan.$attributes }
    }

    return null
  }

  static async simpleInfoAboutBan(userId: number) {
    const activeBan = await this.isUserBanned(userId)

    if (activeBan) {
      return { isBanned: true, unlockDate: activeBan.bannedUntil }
    }

    return { isBanned: false, unlockDate: null }
  }
}
