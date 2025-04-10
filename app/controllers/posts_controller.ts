import Post from '#models/post'
import Topic from '#models/topic'
import { destroyPostValidator, editPostValidator, storePostValidator } from '#validators/post'
import type { HttpContext } from '@adonisjs/core/http'
import Reaction from '#models/reaction'

export default class PostController {
  public async index({ request, auth, response }: HttpContext) {
    const topicSlug = request.param('slug')

    const { page = 1, perPage = 10 } = request.only(['page', 'perPage'])

    const topicWithPosts = await Topic.query()
      .where('slug', topicSlug)
      .preload('pinnedPost')
      .firstOrFail()

    const posts = await topicWithPosts
      .related('posts')
      .query()
      .preload('user')
      .preload('reaction')
      .orderBy('created_at', 'asc')
      .paginate(page, perPage)

    const result = posts.serialize()

    const user = await auth.use('jwt').user

    const groupedPosts = result.data.map((post) => {
      const reactionCounts = {
        like: 0,
        dislike: 0,
      }
      let userReaction: string | null = null

      const reactions = post.reaction || []

      reactions.forEach((reaction: Reaction) => {
        if (reaction.reactionType === 'like') {
          reactionCounts.like += 1
        } else if (reaction.reactionType === 'dislike') {
          reactionCounts.dislike += 1
        }
        if (user && reaction.userId === user.id) {
          userReaction = reaction.reactionType
        }
      })

      return {
        ...post,
        reaction: reactionCounts,
        myReaction: userReaction,
      }
    })

    const finalResult = {
      meta: result.meta,
      data: groupedPosts,
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

  public async pinPost({ request, response }: HttpContext) {
    const { topicId, postId } = request.only(['topicId', 'postId'])

    const topic = await Topic.find(topicId)
    if (!topic) {
      return response.notFound({ message: 'Nie znaleziono tematu' })
    }

    const post = await Post.find(postId)
    if (!post || post.topicId !== topic.id) {
      return response.badRequest({ message: 'Post nie należy do tematu' })
    }

    topic.pinnedPostId = post.id
    await topic.save()

    await topic.load('pinnedPost')

    return response.ok({
      message: 'Post przypięty',
      topic,
    })
  }
}
