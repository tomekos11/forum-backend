import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Tworzymy tablicę użytkowników z zahaszowanymi hasłami
    // TODO ogarnac typy
    const users = [
      { username: 'admin', password: 'admin', role: 'admin' },
      { username: 'moderator', password: 'moderator', role: 'moderator' },
      { username: 'marketing', password: 'marketing', role: 'marketing' },
      { username: 'user1', password: 'user1', role: 'user' },
      { username: 'user2', password: 'user2', role: 'user' },
      { username: 'user3', password: 'user3', role: 'user' },
    ]

    // Zastosowanie createMany do zapisania wielu użytkowników
    //await User.createMany(users)

    User.disableHooks = true
    for (const user of users) {
      const addedUser = await User.create(user)

      await addedUser.related('data').create({
        bio: 'Frontend Developer',
        description: 'To jest mój opis. Jestem mega koxem',
        image: 'https://i.pravatar.cc/150?img=' + addedUser.id,
      })
    }

    User.disableHooks = false
  }
}
