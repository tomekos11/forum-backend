import Topic from '#models/topic'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const topics = [
      {
        name: 'Stored XSS',
        forumId: 1,
        isPrimary: true,
        userId: 3,
      },
      {
        name: 'Reflected XSS',
        forumId: 1,
        isPrimary: true,
        userId: 3,
      },
      {
        name: 'Blind XSS',
        forumId: 1,
        isPrimary: true,
        userId: 4,
      },
      {
        name: 'DOM-Based XSS',
        forumId: 1,
        isPrimary: true,
      },
      {
        name: 'Stored XSS (Advanced)',
        forumId: 1,
      },
      {
        name: 'Reflected XSS (Advanced)',
        forumId: 1,
      },
      {
        name: 'Mutated XSS',
        forumId: 1,
      },
      {
        name: 'XHR-Based XSS',
        forumId: 1,
      },
      {
        name: 'Flash XSS',
        forumId: 1,
      },
      {
        name: 'JavaScript Injection',
        forumId: 1,
      },
      {
        name: 'Cross-Site Script Inclusion (XSSI)',
        forumId: 1,
      },
      {
        name: 'Mam pytanie odnośnie XSS',
        forumId: 1,
      },
      {
        name: 'Problem XSS nuxt',
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
