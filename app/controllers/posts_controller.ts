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
import MarkNotificationsRead from '#events/mark_notifications_read'
import PostReply from '#models/post_reply'

export default class PostController {
  public async store({ request, auth, response }: HttpContext) {
    const user = await auth.use('jwt').authenticate()

    const { content, topicId, quotedPostId } = await storePostValidator.validate(request.all())

    const topic = await Topic.find(topicId)
    if (!topic || topic.isClosed) return response.badRequest({ message: 'Temat jest zamknięty.' })

    const post = await Post.create({
      userId: user.id,
      topicId,
      content,
    })

    if (quotedPostId) {
      await PostReply.create({
        postId: quotedPostId,
        replyId: post.id,
      })
    }

    await post.load('user', (userQuery) => userQuery.preload('data'))

    await post.load('quote', (quoteQuery) => {
      quoteQuery.preload('quotedPost', (quotedPostQuery) => {
        quotedPostQuery.preload('quote').preload('user')
      })
    })

    const serializedPost = post.serialize()
    serializedPost.reaction = { like: 0, dislike: 0 }

    UserService.updatePostStatsCache(user.id) // Aktualizacja countera
    NewPost.dispatch(post) //event emit

    return response.created({ message: 'Post dodany!', post: serializedPost })
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
      .if(currentUser, (query) => {
        query.preload('followers', (followersQuery) => {
          followersQuery.where('users.id', currentUser!.id)
        })
      })
      .firstOrFail()

    const firstPost = await topic
      .related('posts')
      .query()
      .orderBy('created_at', 'asc')
      .preload('user', (userQuery) => userQuery.preload('data'))
      .preload('reaction')
      .first()

    const query = topic
      .related('posts')
      .query()
      .select('*')
      .preload('user', (userQuery) => {
        userQuery.preload('data')
      })
      .preload('postHistories', (PostHistoriesQuery) =>
        PostHistoriesQuery.groupLimit(1).preload('editor')
      )
      .preload('reaction')
      .preload('quote', (quoteQuery) => {
        quoteQuery.preload('quotedPost', (quotedPostQuery) => {
          quotedPostQuery.preload('quote').preload('user')
        })
      })

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

    if (currentUser) {
      MarkNotificationsRead.dispatch(paginatedPosts)
    }

    const { data: posts, meta } = paginatedPosts.serialize()

    const quotedPostIds = posts
      .filter((post) => post.quote?.quotedPost)
      .map((post) => post.quote.quotedPost.id)

    const quotedPosts = await db
      .from((subquery) =>
        subquery
          .from('posts')
          .where('topic_id', topic.id)
          .select('id', db.raw('ROW_NUMBER() OVER (ORDER BY posts.id ASC) AS rowNumber'))
          .as('ranked_posts')
      )
      .whereIn('id', quotedPostIds)

    posts.forEach((post) => {
      if (post.quote?.quotedPost) {
        const quotedPost = quotedPosts.find((p) => p.id === post.quote.quotedPost.id)
        if (quotedPost) {
          post.quote.quotedPost.page = Math.ceil(quotedPost.rowNumber / 10)
          post.quote.quotedPost.perPage = 10
          post.quote.quotedPost.rowNumber = ((quotedPost.rowNumber - 1) % 10) + 1
        }
      }
      post.notification = !!post.notification.length
    })

    const data = ReactionService.summarizeReactions(posts, currentUser)

    const serializedTopic = topic.serialize()

    serializedTopic.isFollowed = topic.followers?.length > 0
    delete serializedTopic.followers

    if (serializedTopic.pinnedPost) {
      const pinnedPost = ReactionService.summarizeReactions(
        [serializedTopic.pinnedPost],
        currentUser
      )[0]

      serializedTopic.pinnedPost = pinnedPost
    }

    let firstPostSerialized = null
    if (firstPost) {
      firstPostSerialized = firstPost.serialize()
      firstPostSerialized = ReactionService.summarizeReactions([firstPostSerialized], currentUser)
    }

    return response.ok({
      meta: meta,
      data,
      topic: serializedTopic,
      firstPost: firstPostSerialized,
    })
  }

  public async edit({ request, auth, response }: HttpContext) {
    const user = await auth.use('jwt').authenticate()

    const { content, postId } = await editPostValidator.validate(request.all())

    const post = await Post.query().where('id', postId).preload('user').firstOrFail()

    if (user.role !== 'admin' && user.role !== 'moderator' && post.userId !== user.id) {
      return response.forbidden({ error: 'Brak uprawnień' })
    }

    if (post.isDeleted) {
      return response.forbidden({ error: 'Nie można usunąć usuniętego postu.' })
    }

    post.content = content
    post.editedBy = user.id

    await post.save()

    await post.load('postHistories', (PostHistoriesQuery) =>
      PostHistoriesQuery.groupLimit(1).preload('editor')
    )

    return response.created({ message: 'Post został zedytowany!', post })
  }

  public async destroy({ request, auth, response }: HttpContext) {
    const user = await auth.use('jwt').authenticate()

    const { postId } = await destroyPostValidator.validate(request.all())

    const post = await Post.query()
      .where('id', postId)
      .preload('user', (userQuery) => userQuery.preload('data'))
      .preload('topic', (topicQuery) => {
        topicQuery.preload('posts', (postsQuery) => {
          postsQuery.orderBy('created_at', 'asc').limit(1)
        })
      })
      .firstOrFail()

    if (post.topic.posts[0]?.id === post.id) {
      return response.forbidden({ error: 'Nie można usunąć pierwszego posta w temacie' })
    }
    if (user.role !== 'admin' && user.role !== 'moderator' && post.userId !== user.id) {
      return response.forbidden({ error: 'Brak uprawnień' })
    }
    if (post.isDeleted) {
      return response.forbidden({ error: 'Post został już usunięty' })
    }

    const p = await post.deleteWithHistory(user.id)

    await p.load('postHistories', (PostHistoriesQuery) =>
      PostHistoriesQuery.groupLimit(1).preload('editor')
    )

    return response.ok({ message: 'Post został usunięty', post: p })
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
