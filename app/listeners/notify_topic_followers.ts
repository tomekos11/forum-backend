import NewPost from '#events/new_post'
import Notification from '#models/notification'

export default class NotifyTopicFollowers {
  async handle(event: NewPost) {
    const post = event.post

    const topic = await post.related('topic').query().preload('followers').firstOrFail()

    const followers = topic.followers || []

    for (const user of followers) {
      if (user.id === post.userId) continue

      await Notification.create({
        userId: user.id,
        postId: post.id,
        topicId: post.topicId,
        type: 'new_post',
        message: `Nowy post w temacie ${topic.name}`,
      })
    }
  }
}
