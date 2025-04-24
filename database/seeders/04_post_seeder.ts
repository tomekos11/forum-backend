import Post from '#models/post'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const users = await User.query().whereIn('id', [1, 2, 3, 4, 5, 6])

    if (users.length < 6) return

    const posts = []
    const topics = Array.from({ length: 15 }, (_, index) => index + 1)

    const postContents = [
      'To jest post stworzony przez użytkownika.',
      'Dzień dobry, jestem nowym użytkownikiem!',
      'Zgadzam się z tym, co napisałeś, ale mam pewne uwagi.',
      'Nie jestem pewien, czy się zgadzam z tym tematem, ale warto o tym rozmawiać.',
      'To świetna inicjatywa, mam nadzieję, że temat będzie dalej rozwijany.',
      'Chciałbym dodać coś do tej dyskusji, oto moja opinia.',
      'To wspaniały temat, cieszę się, że ktoś poruszył tę sprawę.',
      'Zgłaszam problem z tym tematem, proszę o wyjaśnienie.',
      'Ciekawe spojrzenie, mam nadzieję, że pojawi się więcej takich postów.',
    ]

    for (let repeat = 0; repeat < 3; repeat++) {
      for (let i = 1; i <= 6; i++) {
        const user = users.find((u) => u.id === i)

        for (let topicId = 1; topicId <= 15; topicId++) {
          const content = postContents[(i + topicId) % postContents.length]

          posts.push({
            userId: user.id,
            topicId,
            content: content,
            isDeleted: false,
          })
        }
      }
    }

    await Post.createMany(posts)
  }
}
