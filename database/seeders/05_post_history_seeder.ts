import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Post from '#models/post'
import PostHistory from '#models/post_history'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    const admin = await User.find(1)
    const user1 = await User.find(2)
    const user2 = await User.find(3)

    const post1 = await Post.find(1)
    const post2 = await Post.find(2)

    if (!admin || !user1 || !user2 || !post1 || !post2) return
    const postHistories = [
      {
        postId: post1.id,
        content: 'przed edycja',
        userId: user1.id,
      },
      {
        postId: post1.id,
        content: 'przed edycja2',
        userId: user2.id,
      },
      {
        postId: post2.id,
        content: 'Przed usunieciem',
        userId: user2.id,
        deletedBy: admin.id,
      },
    ]

    await PostHistory.createMany(postHistories)
  }
}
