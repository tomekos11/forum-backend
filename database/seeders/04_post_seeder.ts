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
        userId: moderator.id,
        topicId: 1,
        content: 'To jest post stworzony przez moderatora.',
      },
      {
        userId: user1.id,
        topicId: 1,
        content: 'To jest post stworzony przez użytkownika 1.',
      },
      {
        userId: user1.id,
        topicId: 2,
        content: 'To jest post stworzony przez użytkownika 1.',
      },
      {
        userId: user1.id,
        topicId: 2,
        content: 'To jest post stworzony przez użytkownika 1.',
      },
      {
        userId: user2.id,
        topicId: 3,
        content: 'To jest post stworzony przez użytkownika 2.',
      },
    ]

    // Tworzenie postów w bazie
    await Post.createMany(posts)
  }
}
