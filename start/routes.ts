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
    router.get('/', [PostController, 'index'])
    router.post('/', [PostController, 'store'])
    router.delete('/:id', [PostController, 'destroy'])
  })
  .prefix('posts')

router
  .group(() => {
    router.get('/', [ForumsController, 'index'])
  })
  .prefix('forums')

router
  .group(() => {
    router.get('/check-admin', [AuthController, 'checkAdmin'])
  })
  .use([middleware.auth(), middleware.role('admin')])
