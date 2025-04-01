import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostController {
  public async index({ response }: HttpContext) {
    const posts = await Post.query().orderBy('created_at', 'desc')
    return response.ok(posts)
  }

  public async store({ request, auth, response }: HttpContext) {
    await auth.use('jwt').authenticate()
    const user = auth.user!

    const { title, content, topicId } = request.only(['title', 'content', 'topicId'])

    if (!title || !content || !topicId) {
      return response.badRequest({ error: 'title i content i topicId są wymagane' })
    }

    const post = await Post.create({
      userId: user.id,
      topicId,
      title,
      content,
    })

    return response.created({ message: 'Post dodany!', post })
  }

  // TODO dostosowac role do usuwania postów
  public async destroy({ params, auth, response }: HttpContext) {
    await auth.use('jwt').authenticate()
    if (auth.user?.role !== 'admin') {
      return response.forbidden({ error: 'Brak uprawnień administratora' })
    }

    const post = await Post.find(params.id)
    if (!post) {
      return response.notFound({ error: 'Post nie został znaleziony' })
    }

    await post.delete()
    return response.ok({ message: 'Post został usunięty' })
  }
}
