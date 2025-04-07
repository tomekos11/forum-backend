import Post from '#models/post'
import Topic from '#models/topic'
import { destroyPostValidator, editPostValidator, storePostValidator } from '#validators/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostController {
  public async index({ request, response }: HttpContext) {
    const topicSlug = request.param('slug')

    const page = request.param('page') || 1
    const perPage = request.param('perPage') || 10

    const topicWithPosts = await Topic.query().where('slug', topicSlug).firstOrFail()

    const posts = await topicWithPosts
      .related('posts')
      .query()
      .preload('user')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)

    const result = posts.serialize()

    const finalResult = {
      meta: result.meta,
      data: result.data,
      topic: topicWithPosts.serialize(),
    }

    return response.ok(finalResult)
  }

  public async store({ request, auth, response }: HttpContext) {
    const user = await auth.use('jwt').authenticate()

    const { content, topicId } = await storePostValidator.validate(request.all())

    const post = await Post.create({
      userId: user.id,
      topicId,
      content,
    })

    await post.load('user')

    return response.created({ message: 'Post dodany!', post })
  }

  public async edit({ request, auth, response }: HttpContext) {
    const user = await auth.use('jwt').authenticate()

    const { content, postId } = await editPostValidator.validate(request.all())

    const post = await Post.query().where('id', postId).preload('user').firstOrFail()

    console.log(user.role, post.userId, user.id)
    if (user.role !== 'admin' && user.role !== 'moderator' && post.userId !== user.id) {
      return response.forbidden({ error: 'Brak uprawnień' })
    }

    post.content = content
    await post.save()

    return response.created({ message: 'Post został zedytowany!', post })
  }

  public async destroy({ request, auth, response }: HttpContext) {
    const user = await auth.use('jwt').authenticate()

    const { postId } = await destroyPostValidator.validate(request.all())

    const post = await Post.query().where('id', postId).preload('user').firstOrFail()

    if (user.role !== 'admin' && user.role !== 'moderator' && post.userId !== user.id) {
      return response.forbidden({ error: 'Brak uprawnień' })
    }
    if (post.isDeleted) {
      return response.forbidden({ error: 'Post został już usunięty' })
    }
    await post.deleteWithHistory(user.id)
    return response.ok({ message: 'Post został usunięty' })
  }
}
