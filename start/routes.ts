/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { throttle } from '#start/limiter'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

const AuthController = () => import('#controllers/auth_controller')
const PostController = () => import('#controllers/posts_controller')
const TopicsController = () => import('#controllers/topics_controller')
const ForumsController = () => import('#controllers/forums_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const ReactionSController = () => import('#controllers/reactions_controller')
const NotificationsController = () => import('#controllers/notifications_controller')

router.post('/login', [AuthController, 'login']).use(throttle)
router.post('/register', [AuthController, 'register'])
router.get('/logout', [AuthController, 'logout'])

router.get('/online', [AuthController, 'online'])
router.get('/check-user', [AuthController, 'checkUser'])

router
  .group(() => {
    router
      .group(() => {
        router.get('/:slug', [PostController, 'index']) // + Lista postów dla danego topics -> potrzeba topic_id
        router.post('/', [PostController, 'store']) //Dodawanie posta do topica -> potrzeba topic_id
        router.patch('/', [PostController, 'edit'])
        router.delete('/', [PostController, 'destroy']) //Usuwanie posta -> admin/twórca -> potrzeba post_id
        router.post('/pin', [PostController, 'pinPost']).use([middleware.role('moderator')])
      })
      .prefix('posts')

    router
      .group(() => {
        router.get('/name', [TopicsController, 'getName'])
        router.get('/:slug', [TopicsController, 'index']) // + Lista topiców w danym forum -> potrzeba id forum
        router.post('/follow', [TopicsController, 'follow']).use([middleware.auth()])
        router.post('/:slug/close', [TopicsController, 'close']).use([middleware.role('moderator')])
        router.post('/:forumSlug', [TopicsController, 'store']).use([middleware.auth()]) // + Dodawanie tematu -> admin/casual rozroznianie
        //Edytowanie tematu -> nazwa, description? -> admin/twórca
        //Usuwanie tematu -> admin/twórca -> co z postami?
      })
      .prefix('topics')

    router
      .group(() => {
        router.get('/', [ForumsController, 'index']) // + lista for
        router.get('/name', [ForumsController, 'getName'])
        router.get('/findTopic', [ForumsController, 'findTopic'])
        router
          .group(() => {
            router.post('/', [ForumsController, 'store']) // + dodawanie nowych for -> admin
            router.patch('forumId', [ForumsController, 'update']) // + Edytowanie istniejących for -> admin
          })
          .use([middleware.auth(), middleware.role('admin')])
        //Usuwanie for -> admin -> co z topicami/postami?
      })
      .prefix('forums')

    router
      .group(() => {
        router.get('/find', [ProfilesController, 'find'])
        router.get('/:username', [ProfilesController, 'show'])
        router.get('/:username/topics', [ProfilesController, 'showTopics'])
        router
          .group(() => {
            router.patch('/profile', [ProfilesController, 'edit'])
            router.post('/avatar', [ProfilesController, 'addPhoto'])
          })
          .use([middleware.auth()])
      })
      .prefix('users')

    router
      .group(() => {
        router
          .group(() => {
            router.post('/', [ReactionSController, 'react'])
          })
          .use([middleware.auth()])
      })
      .prefix('reaction')

    router
      .group(() => {
        router.patch('/', [NotificationsController, 'markAsRead']).use([middleware.auth()])
        router.get('/', [NotificationsController, 'notifyAll']).use([middleware.auth()])
      })
      .prefix('notification')
  })
  .use([middleware.tracker()])
