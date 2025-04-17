import Forum from '#models/forum'
import db from '@adonisjs/lucid/services/db'

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
      //TODO -> lepsza filtracja
      topicsQuery.where('name', 'like', `%${filter}%`)
    }

    if (sortBy === 'last_post') {
      topicsQuery.select('topics.*')
      topicsQuery.select(
        db.rawQuery(`(
          SELECT MAX(posts.created_at)
          FROM posts
          WHERE posts.topic_id = topics.id
        ) AS last_post_date`)
      )
      topicsQuery.orderBy('last_post_date', order)
    } else {
      topicsQuery.orderBy(sortBy, order)
    }

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
