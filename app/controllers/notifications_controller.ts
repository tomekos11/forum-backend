import Notification from '#models/notification'
import Post from '#models/post'
import Topic from '#models/topic'
import NotificationService from '#services/notification_service'
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

    const unread = await NotificationService.getUnreadGroupedByTopic(user!.id)

    return response.ok({ notifications: unread })
  }
  public async notifyAll({ auth, response }: HttpContext) {
    const user = await auth.use('jwt').user!
    const perPage = 10

    const notificationsAll = await Notification.query()
      .where('user_id', user.id)
      .preload('post', (query) => {
        query.select('*').preload('user', (userQuery) => {
          userQuery.preload('data')
        })
      })
      .orderBy('created_at', 'desc')
      .preload('topic', (query) => {
        query
          .select('*')
          .preload('forum')
          .withCount('posts', (topicQuery) => {
            topicQuery.as('postCounter')
          })
      })

    const grouped: Record<number, { topic: Topic; notifications: Notification[] }> = {}

    for (const noti of notificationsAll) {
      const topicId = noti.topicId

      if (!grouped[topicId]) {
        grouped[topicId] = {
          topic: noti.topic,
          notifications: [],
        }
      }
      grouped[topicId].notifications.push(noti)
    }

    const unreadTopics = []
    const readTopics = []

    for (const topicId in grouped) {
      const { topic, notifications } = grouped[topicId]

      const unread = notifications.filter((n) => !n.read)
      const lastPost = notifications[0].post
      const lastPostId = lastPost?.id

      let page = null
      if (lastPostId) {
        const postPosition = await Post.query()
          .where('topic_id', Number(topicId))
          .where('id', '<=', lastPostId)
          .count('* as count')

        const count = Number(postPosition[0].$extras.count)
        page = Math.ceil(count / perPage)
      }

      const lastPostAt = lastPost?.createdAt || notifications[0].createdAt
      const lastReadAt =
        notifications.filter((n) => n.updatedAt !== null && n.read).map((n) => n.updatedAt)?.[0] ??
        null

      const result = {
        topic,
        lastPostAt,
        lastReadAt,
        lastPost,
        page,
      }

      if (unread.length === 0) {
        readTopics.push(result)
      } else {
        unreadTopics.push({
          ...result,
          unreadCount: unread.length,
        })
      }
    }

    return response.ok({
      unread: unreadTopics,
      read: readTopics,
    })
  }
}
