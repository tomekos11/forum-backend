import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Reaction from '#models/reaction'
import User from '#models/user'
import Post from '#models/post'

export default class extends BaseSeeder {
  async run() {
    // Wyszukiwanie użytkowników i postów
    const users = await User.query().whereIn('id', [1, 2, 3, 4, 5, 6]) // Użytkownicy od 1 do 6
    const posts = await Post.query().whereIn('id', [1, 16, 17, 18, 19, 20]) // Przykładowe posty

    // Jeżeli użytkownicy lub posty nie zostały znalezione, przerywamy
    if (users.length < 6 || posts.length < 6) return

    // Przygotowanie reakcji
    const reactions = []

    // Dodanie reakcji do postów
    for (const post of posts) {
      for (const [j, user] of users.entries()) {
        // W przypadku każdego użytkownika przypisujemy reakcję "like" i "dislike"
        // Możesz dostosować zależnie od wymagań (np. dodać dodatkowe warunki)
        if (j % 2 === 0) {
          reactions.push({
            userId: user.id,
            postId: post.id,
            reactionType: 'like',
          })
        } else {
          reactions.push({
            userId: user.id,
            postId: post.id,
            reactionType: 'dislike',
          })
        }
      }
    }

    // Tworzenie reakcji w bazie
    await Reaction.createMany(reactions)
  }
}
