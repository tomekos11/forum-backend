import Forum from '#models/forum'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const forums = [
      {
        name: 'Atak XSS',
        description: 'Tutaj znajdziesz przykłady ataków XSS',
      },
      {
        name: 'Atak CSRF',
        description: 'Tutaj znajdziesz przykłady ataków CSRF',
      },
    ]

    await Forum.createMany(forums)
  }
}
