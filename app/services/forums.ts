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
