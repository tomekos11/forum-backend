import Notification from '#models/notification'
import Post from '#models/post'

export default class NotificationService {
  public static async getUnreadGroupedByTopic(userId: number, perPage = 10) {
    const unreadNotifications = await Notification.query()
      .where('user_id', userId)
      .where('read', false)
      .groupBy('topic_id')
      .select('*')
      .count('* as total')
      .preload('topic', (topicQuery) => {
        topicQuery.preload('forum')
      })

    const mapped = await Promise.all(
      unreadNotifications.map(async (row) => {
        const topicId = row.topicId
        const postId = row.postId

        const postPosition = await Post.query()
          .where('topic_id', topicId)
          .where('id', '<=', postId)
          .count('* as count')

        const count = Number(postPosition[0].$extras.count)
        const page = Math.ceil(count / perPage)

        return {
          topicName: row.topic.name,
          topicSlug: row.topic.slug,
          forumSlug: row.topic.forum.slug,
          count: Number.parseInt(row.$extras.total),
          page,
          perPage,
        }
      })
    )

    return mapped
  }
}
