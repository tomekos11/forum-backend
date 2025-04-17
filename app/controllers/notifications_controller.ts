import MarkNotificationsRead from '#events/mark_notifications_read'
import Notification from '#models/notification'
import Post from '#models/post'
import Topic from '#models/topic'
import { markAsReadValidator } from '#validators/notification'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotificationsController {
  public async markAsRead({ request, auth, response }: HttpContext) {
    const user = await auth.use('jwt').user

    const { topicSlug } = await markAsReadValidator.validate(request.only(['topicSlug']))

    const topic = await Topic.query().where('slug', topicSlug).firstOrFail()

    const notifications = await Notification.query()
      .where('user_id', user!.id)
      .andWhere('topic_id', topic.id)
      .andWhere('read', false)
      .update({ read: true })

    const unreadNotifications = await Notification.query()
      .where('user_id', user!.id)
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
        const page = Math.ceil(count / 10)

        return {
          topicSlug: row.topic.slug,
          forumSlug: row.topic.forum.slug,
          count: Number.parseInt(row.$extras.total),
          page,
          perPage: 10,
        }
      })
    )

    return response.ok({ notifications: mapped })
  }
}
