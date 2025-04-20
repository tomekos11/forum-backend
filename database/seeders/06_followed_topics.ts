import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Topic from '#models/topic'

export default class extends BaseSeeder {
  async run() {
    const admin = await User.find(1)
    const topic = await Topic.find(1)

    if (!admin || !topic) return

    await admin.related('followedTopics').attach([topic.id])
  }
}
