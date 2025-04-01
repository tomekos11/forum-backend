import Forum from '#models/forum'

export const forumsList = async () => {
  try {
    const forums = await Forum.query().preload('topics')

    for (const forum of forums) {
      for (const topic of forum.topics) {
        const latestPost = await topic
          .related('posts')
          .query()
          .orderBy('created_at', 'desc')
          .first()

        if (
          (latestPost !== null && !topic.$extras.latestPost) ||
          forum.$extras.latestPost?.createdAt.ts < latestPost?.createdAt?.ts
        ) {
          forum.$extras.latestPost = latestPost
        }
      }
    }

    return forums
  } catch (error) {
    console.error('Błąd podczas pobierania forów:', error)
    return []
  }
}
