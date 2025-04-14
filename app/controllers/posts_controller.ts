import Post from '#models/post'
import Topic from '#models/topic'
import {
  destroyPostValidator,
  editPostValidator,
  storePostValidator,
  indexPostValidator,
} from '#validators/post'
import type { HttpContext } from '@adonisjs/core/http'
import Reaction from '#models/reaction'
import ReactionService from '#services/reaction_service'

export default class PostController {
  // public async index({ request, auth, response }: HttpContext) {
  //   const topicSlug = request.param('slug')

  //   const { page = 1, perPage = 10 } = request.only(['page', 'perPage'])

  //   const topicWithPosts = await Topic.query()
  //     .where('slug', topicSlug)
  //     .preload('pinnedPost')
  //     .firstOrFail()

  //   const posts = await topicWithPosts
  //     .related('posts')
  //     .query()
  //     .preload('user')
  //     .preload('reaction')
  //     .orderBy('created_at', 'asc')
  //     .paginate(page, perPage)

  //   const result = posts.serialize()

  //   const user = auth.use('jwt').user

  //   const groupedPosts = result.data.map((post) => {
  //     const reactionCounts = {
  //       like: 0,
  //       dislike: 0,
  //     }
  //     let userReaction: string | null = null

  //     const reactions = post.reaction || []

  //     reactions.forEach((reaction: Reaction) => {
  //       if (reaction.reactionType === 'like') {
  //         reactionCounts.like += 1
  //       } else if (reaction.reactionType === 'dislike') {
  //         reactionCounts.dislike += 1
  //       }
  //       if (user && reaction.userId === user.id) {
  //         userReaction = reaction.reactionType
  //       }
  //     })

  //     return {
  //       ...post,
  //       reaction: reactionCounts,
  //       myReaction: userReaction,
  //     }
  //   })

  //   const finalResult = {
  //     meta: result.meta,
  //     data: groupedPosts,
  //     topic: topicWithPosts.serialize(),
  //   }

  //   return response.ok(finalResult)
  // }

  public async store({ request, auth, response }: HttpContext) {
    const user = await auth.use('jwt').authenticate()

    const { content, topicId } = await storePostValidator.validate(request.all())

    const topic = await Topic.find(topicId)
    if (!topic || topic.isClosed) return response.badRequest({ message: 'Temat jest zamknięty.' })

    const post = await Post.create({
      userId: user.id,
      topicId,
      content,
    })

    await post.load('user')

    return response.created({ message: 'Post dodany!', post })
  }

  public async index({ request, auth, response }: HttpContext) {
    const topicSlug = request.param('slug')

    const {
      page = 1,
      perPage = 10,
      sortBy = 'created_at',
      order = 'asc',
    } = await indexPostValidator.validate(request.only(['page', 'perPage', 'sortBy', 'order']))

    const topic = await Topic.query()
      .where('slug', topicSlug)
      .preload('pinnedPost', (pinnedPostQuery) =>
        pinnedPostQuery.preload('user').preload('reaction')
      )
      .firstOrFail()

    const paginatedPosts = await topic
      .related('posts')
      .query()
      .preload('user')
      .preload('reaction')
      .select('posts.*')
      .leftJoin('reactions', 'posts.id', 'reactions.post_id')
      .groupBy('posts.id')
      .count('* as reaction_count')
      .orderBy(sortBy, order)
      .paginate(page, perPage)

    const { data: posts, meta } = paginatedPosts.serialize()
    const currentUser = auth.use('jwt').user

    const data = ReactionService.summarizeReactions(posts, currentUser)

    const serializedTopic = topic.serialize()

    if (serializedTopic.pinnedPost) {
      const pinnedPost = ReactionService.summarizeReactions(
        [serializedTopic.pinnedPost],
        currentUser
      )[0]

      serializedTopic.pinnedPost = pinnedPost
    }

    return response.ok({
      meta: meta,
      data,
      topic: serializedTopic,
    })
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

  public async pinPost({ request, response, auth }: HttpContext) {
    const { topicId, postId } = request.only(['topicId', 'postId'])

    const topic = await Topic.find(topicId)
    if (!topic) {
      return response.notFound({ message: 'Nie znaleziono tematu' })
    }

    if (!postId) {
      topic.pinnedPostId = null
      await topic.save()

      return response.ok({
        message: 'Post odpięty',
        topic,
      })
    }
    const post = await Post.find(postId)
    if (!post || post.topicId !== topic.id) {
      return response.badRequest({ message: 'Post nie należy do tematu' })
    }

    topic.pinnedPostId = post.id
    await topic.save()

    await topic.load('pinnedPost')

    const serializedTopic = topic.serialize()
    const currentUser = auth.use('jwt').user

    const pinnedPost = ReactionService.summarizeReactions(
      [serializedTopic.pinnedPost],
      currentUser
    )[0]

    serializedTopic.pinnedPost = pinnedPost

    return response.ok({
      message: 'Post przypięty',
      topic,
    })
  }
}
