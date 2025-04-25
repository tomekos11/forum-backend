import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Post from '#models/post'
import PostHistory from '#models/post_history'

export default class extends BaseSeeder {
  async run() {
    const adminUser = await User.find(1)
    const regularUser1 = await User.find(2)
    const regularUser2 = await User.find(3)

    const post1 = await Post.find(1)
    const post2 = await Post.find(16)

    if (!adminUser || !regularUser1 || !regularUser2 || !post1 || !post2) return

    const postHistories = [
      {
        postId: post1.id,
        content: 'Initial content before edit',
        editorId: regularUser1.id,
      },
      {
        postId: post1.id,
        content: 'Second edit of post1 content',
        editorId: regularUser2.id,
      },
      {
        postId: post2.id,
        content: 'Initial content before deletion',
        editorId: regularUser1.id,
        isDeleted: true,
      },
    ]

    await PostHistory.createMany(postHistories)

    post2.isDeleted = true
    post2.content = '[Post został usunięty]'
    await post2.save()

    const additionalHistories = [
      {
        postId: post1.id,
        content: 'Third edit of post1 content',
        editorId: adminUser.id,
      },
      {
        postId: post1.id,
        content: 'Final edit of post1 before closing the thread',
        editorId: regularUser1.id,
      },
    ]

    await PostHistory.createMany(additionalHistories)
  }
}
