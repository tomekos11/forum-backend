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
router.post('/register', [AuthController, 'register'])

router.get('/check-admin', [AuthController, 'checkAdmin'])

router.post('/forums', [ForumsController, 'index'])
router.get('/forums/:forumId/posts', [ForumsController, 'posts'])

// router.post('/topics/:topicId/posts', [TopicsController, 'index'])

router.post('/posts/:topicId', [PostController, 'store'])

router.delete('/posts/:postId', [PostController, 'destroy'])
