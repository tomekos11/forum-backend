import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Topic from '#models/topic'

export default class extends BaseSeeder {
  async run() {
    // Wyszukiwanie użytkowników i tematów
    const users = await User.query().whereIn('id', [1, 2, 3, 4, 5, 6]) // Użytkownicy od 1 do 6
    const topics = await Topic.query().whereIn('id', [1, 2, 3, 4, 5, 6]) // Tematy od 1 do 6

    // Jeżeli użytkownicy lub tematy nie zostały znalezione, przerywamy
    if (users.length < 6 || topics.length < 6) return

    // Dodanie tematów do użytkowników
    for (const user of users) {
      // Używamy metody sync, która dodaje tylko brakujące powiązania
      await user.related('followedTopics').sync(
        topics.map((topic) => topic.id),
        true
      ) // true - ensure the records are synced and avoids duplicates
    }
  }
}
