import MarkNotificationsRead from '#events/mark_notifications_read'

export default class MarkNotificationsAsRead {
  async handle(event: MarkNotificationsRead) {
    const posts = event.posts

    for (const post of posts) {
      if (!post.notification) continue

      for (const notification of post.notification) {
        if (!notification.read) {
          notification.read = true
          await notification.save()
        }
      }
    }
  }
}
