import Post from '#models/post'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Wyszukiwanie użytkowników: moderatora i zwykłych użytkowników
    const moderator = await User.find(2)
    const user1 = await User.find(3)
    const user2 = await User.find(4)

    if (!moderator || !user1 || !user2) return

    // Tworzenie postów
    const posts = [
      {
        user_id: moderator.id,
        title: 'Post Moderatora',
        content: 'To jest post stworzony przez moderatora.',
      },
      {
        user_id: user1.id,
        title: 'Post Użytkownika 1',
        content: 'To jest post stworzony przez użytkownika 1.',
      },
      {
        user_id: user2.id,
        title: 'Post Użytkownika 2',
        content: 'To jest post stworzony przez użytkownika 2.',
      },
    ]

    // Tworzenie postów w bazie
    await Post.createMany(posts)
  }
}
