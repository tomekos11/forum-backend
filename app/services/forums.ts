import Forum from '#models/forum'

export const forums = async () => {
  try {
    const res = await Forum.query().preload('topics', (topics) => {
      topics.preload('posts', (posts) => {
        posts.orderBy('created_at', 'desc').limit(25)
      })
    })

    res.forEach((forum) => {
      if (forum.topics.length > 0) {
        forum.$extras.latestPost =
          forum.topics.flatMap((t) => t.posts).sort((a, b) => b.createdAt - a.createdAt)[0] || null
      } else {
        forum.$extras.latestPost = null
      }
    })

    return res
  } catch (error) {
    console.error('Błąd podczas pobierania forów:', error)
    return []
  }
}

// import Forum from '#models/forum'
// import db from '@adonisjs/lucid/services/db'

// export const forums = async () => {
//   try {
//     // Pobieramy fora wraz z tematami, ale BEZ postów
//     const forums = await Forum.query().preload('topics')

//     // Pobieramy tylko najnowsze posty dla każdego forum
//     const latestPosts = await db
//       .from('posts')
//       .select('posts.*')
//       .join('topics', 'topics.id', 'posts.topic_id')
//       .join('forums', 'forums.id', 'topics.forum_id')
//       .whereIn(
//         'topics.forum_id',
//         forums.map((f) => f.id)
//       )
//       .orderBy('posts.created_at', 'desc')
//       .groupBy('topics.forum_id') // Pobieramy tylko najnowszy post dla każdego forum

//     // Mapujemy najnowsze posty do odpowiednich forów
//     forums.forEach((forum) => {
//       forum.$extras.latestPost = latestPosts.find((post) => post.forum_id === forum.id) || null
//     })

//     return forums
//   } catch (error) {
//     console.error('Błąd podczas pobierania forów:', error)
//     return []
//   }
// }
