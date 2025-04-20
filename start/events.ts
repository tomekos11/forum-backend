import emitter from '@adonisjs/core/services/emitter'
import PostCreated from '#events/new_post'
import MarkNotificationsRead from '#events/mark_notifications_read'
import UserActive from '#events/user_active'

emitter.listen(PostCreated, [() => import('#listeners/notify_topic_followers')])
emitter.listen(MarkNotificationsRead, [() => import('#listeners/mark_notifications_as_read')])
emitter.listen(UserActive, [() => import('#listeners/update_user_last_activity')])
emitter.onError((event, error, eventData) => {
  console.error('Error in event listener for:', event)
  console.error('Error:', error)
  console.error('Event data:', eventData)
})
