import Notification from '#models/notification'
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

    const unread = await NotificationService.getUnreadGroupedByTopic(user.id)

    return response.ok({ notifications: unread })
  }
}
