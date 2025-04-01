/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

const AuthController = () => import('#controllers/auth_controller')
const PostController = () => import('#controllers/posts_controller')
const ForumsController = () => import('#controllers/forums_controller')

router.post('/login', [AuthController, 'login'])
router.get('/check-admin', [AuthController, 'checkAdmin'])

router.get('/posts', [PostController, 'index'])
router.post('/posts', [PostController, 'store'])
router.delete('/posts/:id', [PostController, 'destroy'])

router.get('/forums', [ForumsController, 'index'])
