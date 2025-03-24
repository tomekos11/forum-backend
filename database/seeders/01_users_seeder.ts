import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Tworzymy tablicę użytkowników z zahaszowanymi hasłami
    // TODO ogarnac typy
    const users = [
      { username: 'admin', password: await hash.make('admin'), role: 'admin' },
      { username: 'moderator', password: await hash.make('moderator'), role: 'moderator' },
      { username: 'marketing', password: await hash.make('marketing'), role: 'marketing' },
      { username: 'user1', password: await hash.make('user1'), role: 'user' },
      { username: 'user2', password: await hash.make('user2'), role: 'user' },
      { username: 'user3', password: await hash.make('user3'), role: 'user' },
    ]

    // Zastosowanie createMany do zapisania wielu użytkowników
    await User.createMany(users)
  }
}
