import Forum from '#models/forum'

export const topicsList = async (forumSlug: string, page: number, perPage: number) => {
  try {
    const forum = await Forum.query().where('slug', forumSlug).first()

    if (!forum) {
      return []
    }

    const topics = await forum.related('topics').query().preload('posts', (query) => {
      query.orderBy('created_at', 'desc').groupLimit(1)
      .preload('user')
    }).withCount('posts').paginate(page, perPage)

    topics.forEach(topic => {
      topic.$extras.postCounter = topic.$extras.posts_count
    })

    //return topics
    const topicsSerialized = topics.serialize()

    const primaryTopics = topicsSerialized.data.filter((topic) => topic.isPrimary)
    const nonPrimaryTopics = topicsSerialized.data.filter((topic) => !topic.isPrimary)

    return {
      primaryTopics,
      nonPrimaryTopics,
      meta: topicsSerialized.meta
    }
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
