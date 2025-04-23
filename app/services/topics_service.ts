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

    const pinnedTopics = await forum
      .related('topics')
      .query()
      .where('is_primary', true)
      .preload('posts', (query) => {
        query
          .orderBy('created_at', 'desc')
          .groupLimit(1)
          .preload('user', (userQuery) => userQuery.preload('data'))
      })
      .withCount('posts', (query) => {
        query.as('postCounter')
      })
      .orderBy('created_at', 'desc')

    const regularTopicsQuery = forum
      .related('topics')
      .query()
      .where('is_primary', false)
      .preload('posts', (query) => {
        query
          .orderBy('created_at', 'desc')
          .groupLimit(1)
          .preload('user', (userQuery) => userQuery.preload('data'))
      })
      .withCount('posts', (query) => {
        query.as('postCounter')
      })

    if (filter) {
      filter = filter.replace(/[^a-zA-Z0-9 ]/g, '')
      if (filter.trim().length > 0) {
        filter = filter + '*'
      }

      regularTopicsQuery
        .whereRaw(`MATCH(name) AGAINST(? IN BOOLEAN MODE)`, [filter])
        .orderByRaw(`MATCH(name) AGAINST(? IN BOOLEAN MODE) DESC`, [filter])
    }

    if (sortBy === 'last_post') {
      regularTopicsQuery.select('topics.*')
      regularTopicsQuery.select(
        db.rawQuery(`(
        SELECT MAX(posts.created_at)
        FROM posts
        WHERE posts.topic_id = topics.id
      ) AS last_post_date`)
      )
      regularTopicsQuery.orderBy('last_post_date', order)
    } else {
      regularTopicsQuery.orderBy(sortBy, order)
    }

    const paginatedRegularTopics = await regularTopicsQuery.paginate(page, perPage)

    // const primaryTopics = pinnedTopics.map((topic) => ({
    //   ...topic.serialize(),
    //   postCounter: topic.$extras.posts_count,
    // }))

    const regularTopics = paginatedRegularTopics.serialize().data.map((topic) => ({
      ...topic,
      //      postCounter: topic.$extras.posts_count,
    }))

    const meta = paginatedRegularTopics.serialize().meta

    return {
      topics: {
        primaryTopics: pinnedTopics,
        nonPrimaryTopics: regularTopics,
      },
      meta,
    }
  } catch (error) {
    console.error('Błąd podczas pobierania forów:', error)
    return []
  }
}
