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
const ForumsController = () => import('#controllers/forums_controller')

router.post('/login', [AuthController, 'login'])
router.post('/register', [AuthController, 'register'])

router
  .group(() => {
    router.get('/', [PostController, 'index']) //Lista postów dla danego topics -> potrzeba topic_id
    router.post('/:topicId', [PostController, 'store']) //Dodawanie posta do topica -> potrzeba topic_id
    router.delete('/:postId', [PostController, 'destroy']) //Usuwanie posta -> admin/twórca -> potrzeba post_id
  })
  .prefix('posts')

router
  .group(() => {
    //Lista topiców w danym forum -> potrzeba id forum
    //Dodawanie tematu -> admin/casual rozroznianie
    //Edytowanie tematu -> nazwa, description? -> admin/twórca
    //Usuwanie tematu -> admin/twórca -> co z postami?
  })
  .prefix('topics')

router
  .group(() => {
    router.get('/', [ForumsController, 'index']) // lista for
    router
      .group(() => {
        router.post('/', [ForumsController, 'store'])
      })
      .use([middleware.auth(), middleware.role('admin')])
    //Dodawanie nowych for -> admin
    //Edytowanie istniejących for -> admin
    //Usuwanie for -> admin -> co z topicami/postami?
  })
  .prefix('forums')

/*
 *** Middleware example ***
 */
router
  .group(() => {
    router.get('/check-admin', [AuthController, 'checkAdmin'])
  })
  .use([middleware.auth(), middleware.role('admin')])
