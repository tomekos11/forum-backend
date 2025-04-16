import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Post from '#models/post'
import Notification from '#models/notification'
import Topic from '#models/topic'

export default class extends BaseSeeder {
  async run() {
    const admin = await User.find(1)
    const topic = await Topic.find(1)
    const post = await Post.find(1)

    if (!admin || !topic || !post) return

    const notifications = [
      {
        userId: admin.id,
        postId: post.id,
        topicId: topic.id,
        type: 'lol',
        message: 'lol',
        read: false,
      },
    ]

    await Notification.createMany(notifications)
  }
}
