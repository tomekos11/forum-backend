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

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

const AuthController = () => import('#controllers/auth_controller')
const PostController = () => import('#controllers/posts_controller')
const TopicsController = () => import('#controllers/topics_controller')
const ForumsController = () => import('#controllers/forums_controller')

router.get('/logout', [AuthController, 'logout'])
router.get('/online', [AuthController, 'online'])

router
  .group(() => {
    router.post('/login', [AuthController, 'login'])
    router.post('/register', [AuthController, 'register'])

    router
      .group(() => {
        router.get('/:slug', [PostController, 'index']) // + Lista postów dla danego topics -> potrzeba topic_id
        router.post('/:topicId', [PostController, 'store']) //Dodawanie posta do topica -> potrzeba topic_id
        router.patch('/', [PostController, 'edit'])
        router.delete('/', [PostController, 'destroy']) //Usuwanie posta -> admin/twórca -> potrzeba post_id
      })
      .prefix('posts')

    router
      .group(() => {
        router.get('/name', [TopicsController, 'getName'])
        router.get('/:slug', [TopicsController, 'index']) // + Lista topiców w danym forum -> potrzeba id forum

        router
          .group(() => {
            router.post('/:forumId', [TopicsController, 'store']) // + Dodawanie tematu -> admin/casual rozroznianie
          })
          .use([middleware.auth()])
        //Edytowanie tematu -> nazwa, description? -> admin/twórca
        //Usuwanie tematu -> admin/twórca -> co z postami?
      })
      .prefix('topics')

    router
      .group(() => {
        router.get('/', [ForumsController, 'index']) // + lista for
        router.get('/name', [ForumsController, 'getName'])

        router
          .group(() => {
            router.post('/', [ForumsController, 'store']) // + dodawanie nowych for -> admin
            router.patch('forumId', [ForumsController, 'update']) // + Edytowanie istniejących for -> admin
          })
          .use([middleware.auth(), middleware.role('admin')])
        //Usuwanie for -> admin -> co z topicami/postami?
      })
      .prefix('forums')

    /*
     *** Middleware example ***
     */

    router
      .group(() => {
        router.get('/check-user', [AuthController, 'checkUser'])
      })
      .use([middleware.auth()])
  })
  .use([middleware.tracker()])
