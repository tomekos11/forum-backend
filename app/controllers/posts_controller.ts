import Post from '#models/post'
import Topic from '#models/topic'
import {
  destroyPostValidator,
  editPostValidator,
  storePostValidator,
  indexPostValidator,
} from '#validators/post'
import type { HttpContext } from '@adonisjs/core/http'
import ReactionService from '#services/reaction_service'
import UserService from '#services/user_service'

import NewPost from '#events/new_post'
import db from '@adonisjs/lucid/services/db'

export default class PostController {
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

    await post.load('user', (userQuery) => userQuery.preload('data'))

    UserService.updatePostStatsCache(user.id) // Aktualizacja countera
    NewPost.dispatch(post) //event emit

    return response.created({ message: 'Post dodany!', post })
  }

  public async index({ request, auth, response }: HttpContext) {
    const topicSlug = request.param('slug')
    const currentUser = auth.use('jwt').user

    const {
      page = 1,
      perPage = 10,
      sortBy = 'created_at',
      order = 'asc',
    } = await indexPostValidator.validate(request.only(['page', 'perPage', 'sortBy', 'order']))

    const topic = await Topic.query()
      .where('slug', topicSlug)
      .preload('pinnedPost', (pinnedPostQuery) =>
        pinnedPostQuery
          .preload('user', (userQuery) => userQuery.preload('data'))
          .preload('reaction')
      )
      .firstOrFail()

    const query = topic
      .related('posts')
      .query()
      .preload('user', (userQuery) => {
        userQuery.preload('data')
      })
      .preload('reaction')
    if (sortBy === 'reaction_count') {
      query
        .select('posts.*')
        .leftJoin('reactions', 'posts.id', 'reactions.post_id')
        .groupBy('posts.id')
        .select(
          db.rawQuery(`
            COUNT(CASE WHEN reactions.reaction_type = 'like' THEN 1 END)
            -
            COUNT(CASE WHEN reactions.reaction_type = 'dislike' THEN 1 END)
            as reaction_count
          `)
        )
    }
    query
      .preload('notification', (notificationQuery) => {
        notificationQuery.where('user_id', currentUser ? currentUser.id : 0).where('read', false)
      })
      .orderBy(sortBy, order)

    const paginatedPosts = await query.paginate(page, perPage)

    const { data: posts, meta } = paginatedPosts.serialize()

    posts.forEach((post) => {
      post.notification = post.notification.length ? true : false
    })
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

    await topic.load('pinnedPost', (pinnedPostQuery) => {
      pinnedPostQuery.preload('user', (userQuery) => userQuery.preload('data')).preload('reaction')
    })

    const serializedTopic = topic.serialize()
    const currentUser = auth.use('jwt').user

    if (serializedTopic.pinnedPost) {
      const pinnedPost = ReactionService.summarizeReactions(
        [serializedTopic.pinnedPost],
        currentUser
      )[0]

      serializedTopic.pinnedPost = pinnedPost
    }

    return response.ok({
      message: 'Post przypięty',
      topic: serializedTopic,
    })
  }
}
