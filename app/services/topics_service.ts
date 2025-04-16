import Forum from '#models/forum'

export const topicsList = async (
  forumSlug: string,
  page: number,
  perPage: number,
  sortBy: string,
  order: 'asc' | 'desc',
  filter?: string
) => {
  try {
    const forum = await Forum.query().where('slug', forumSlug).first()

    if (!forum) {
      return []
    }

    const topicsQuery = forum
      .related('topics')
      .query()
      .preload('posts', (query) => {
        query
          .orderBy('created_at', 'desc')
          .groupLimit(1)
          .preload('user', (userQuery) => userQuery.preload('data'))
      })
      .withCount('posts')

    if (filter) {
      topicsQuery.where('name', 'like', `%${filter}%`)
    }

    topicsQuery.orderBy(sortBy, order)

    const topics = await topicsQuery.paginate(page, perPage)

    topics.forEach((topic) => {
      topic.$extras.postCounter = topic.$extras.posts_count
    })

    const topicsSerialized = topics.serialize()

    const primaryTopics = topicsSerialized.data.filter((topic) => topic.isPrimary)
    const nonPrimaryTopics = topicsSerialized.data.filter((topic) => !topic.isPrimary)

    return {
      topics: {
        primaryTopics,
        nonPrimaryTopics,
      },
      meta: topicsSerialized.meta,
    }
  } catch (error) {
    console.error('Błąd podczas pobierania forów:', error)
    return []
  }
}
