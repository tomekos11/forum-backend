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

      {
        name: 'Zasady korzystania z forum',
        description: 'Tutaj znajdziesz zasady korzystania z forum',
      },
      {
        name: 'System rang na forum',
        description: 'W tym forum są szczegółowo opisane rangi oraz ich możliwości',
      },
    ]

    await Forum.createMany(forums)
  }
}
