import Forum from '#models/forum'
import Topic from '#models/topic'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const topics = [
      {
        name: 'Stored XSS',
        forumId: 1,
      },
      {
        name: 'Reflected XSS',
        forumId: 1,
      },

      {
        name: 'CSRF - Aplikacja',
        forumId: 2,
      },
      {
        name: 'CSRF - jak usunąć podatność',
        forumId: 2,
      },
    ]

    await Topic.createMany(topics)
  }
}
