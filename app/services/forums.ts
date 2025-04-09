import Forum from '#models/forum'

export const forumsList = async () => {
  try {
    const forums = await Forum.query().preload('topics', (topicsQuery) => {
      topicsQuery.preload('posts', (postsQuery) => {
        postsQuery.preload('user').orderBy('created_at', 'desc')
      })
    })

    for (const forum of forums) {
      forum.$extras.postCounter = 0
      for (const topic of forum.topics) {
        forum.$extras.postCounter += topic.posts.length
        const latestPost = topic.posts[0]

        if (latestPost) {
          if (
            !forum.$extras.latestPost ||
            forum.$extras.latestPost.createdAt < latestPost.createdAt
          ) {
            forum.$extras.latestPost = latestPost
          }
        }
      }
    }

    const finalResult = forums.map((forum) => {
      const serializedForum = forum.serialize()
      delete serializedForum.topics
      return serializedForum
    })

    return finalResult
  } catch (error) {
    console.error('Błąd podczas pobierania forów:', error)
    return []
  }
}
