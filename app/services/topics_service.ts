import Forum from '#models/forum'

export const topicsList = async (forumId: boolean) => {
  try {
    const forum = await Forum.query().where('id', forumId).first()

    if (!forum) {
      return []
    }

    const topics = await forum.related('topics').query().preload('posts', (query) => {
      query.orderBy('created_at', 'desc').groupLimit(1)
      .preload('user')
    })

    return topics
    // const topics = await forum.related('topics').query()
    // for (const topic of topics) {
    //   const latestPost = await topic.related('posts').query().orderBy('created_at', 'desc').first()
    //   topic.$extras.latestPost = latestPost

    //   const postCount = await topic.related('posts').query().count('* as count')
    //   topic.$extras.postCounter = postCount[0]?.$extras?.count || 0
    // }

    // const primaryTopics = topics.filter((topic) => topic.isPrimary)
    // const nonPrimaryTopics = topics.filter((topic) => !topic.isPrimary)

    // return { primaryTopics, nonPrimaryTopics }
  } catch (error) {
    console.error('Błąd podczas pobierania forów:', error)
    return []
  }
}
