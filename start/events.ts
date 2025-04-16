import emitter from '@adonisjs/core/services/emitter'
import PostCreated from '#events/new_post'

emitter.listen(PostCreated, [() => import('#listeners/notify_topic_followers')])

emitter.onError((event, error, eventData) => {
  console.error('Error in event listener for:', event)
  console.error('Error:', error)
  console.error('Event data:', eventData)
})
