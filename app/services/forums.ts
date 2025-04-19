import Forum from '#models/forum'
import Post from '#models/post'
import db from '@adonisjs/lucid/services/db'

export const forumsList = async () => {
  try {
    const forums = await Forum.query()
      .withCount('topics')
      .withAggregate('topics', (query) => {
        query.join('posts', 'posts.topic_id', 'topics.id').count('posts.id').as('posts_count')
      })

    const latestPosts = await Post.query()
      .select('posts.*')
      .join('topics', 'topics.id', 'posts.topic_id')
      .whereIn(
        'topics.forum_id',
        forums.map((f) => f.id)
      )
      .andWhereIn(
        'posts.created_at',
        Post.query()
          .select(db.raw('MAX(posts.created_at)'))
          .join('topics', 'topics.id', 'posts.topic_id')
          .groupBy('topics.forum_id')
          .whereIn(
            'topics.forum_id',
            forums.map((f) => f.id)
          )
      )
      .orderBy('posts.created_at', 'desc')
      .preload('user', (userQuery) => {
        userQuery.preload('data')
      })
      .preload('topic')

    return forums.map((forum) => {
      const latestPost = latestPosts.find((p) => p.topic.forumId === forum.id)

      return {
        ...forum.serialize(),
        topicsCount: forum.$extras.topics_count,
        postCounter: forum.$extras.posts_count,
        latestPost: latestPost?.serialize() ?? null,
      }
    })
  } catch (error) {
    console.error('Błąd podczas pobierania forów:', error)
    return []
  }
}
