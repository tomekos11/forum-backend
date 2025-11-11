import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // Tworzymy tablicę użytkowników z zahaszowanymi hasłami
    // TODO ogarnac typy
    const user2 = await User.findBy('username', 'user2')

    if (user2) {
      user2.related('bans').create({
        bannedBy: 1,
        bannedUntil: DateTime.now().plus({ days: 30 }),
        comment: null,
        reason: 'ban testowy',
      })

      user2.save()
    }
  }
}
