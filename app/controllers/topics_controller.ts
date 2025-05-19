import type { HttpContext } from '@adonisjs/core/http'
import { topicsList } from '#services/topics_service'
import { createTopicValidator, indexTopicValidator, followValidator } from '#validators/topic'
import Topic from '#models/topic'
import Forum from '#models/forum'
import Post from '#models/post'

export default class TopicsController {
  public async index({ request, response }: HttpContext) {
    const forumSlug = request.param('slug')

    const {
      page = 1,
      perPage = 10,
      sortBy = 'created_at',
      order = 'asc',
      filter,
    } = await indexTopicValidator.validate(
      request.only(['page', 'perPage', 'filter', 'sortBy', 'order'])
    )

    const topics = await topicsList(forumSlug, page, perPage, sortBy, order, filter)
    return response.ok(topics)
  }

  public async store({ params, request, response, auth }: HttpContext) {
    const data = request.only(['name', 'isPrimary', 'postContent'])
    const payload = await createTopicValidator.validate(data)

    const user = await auth.use('jwt').authenticate()

    const isPrimary = user.isAtLeastModerator ? (payload.isPrimary ?? false) : false

    const forum = await Forum.query().where('slug', params.forumSlug).first()

    try {
      if (forum) {
        const topic = await Topic.create({
          name: payload.name,
          forumId: forum.id,
          isPrimary: isPrimary,
          userId: user.id,
        })

        await Post.create({
          content: payload.postContent,
          topicId: topic.id,
          userId: user.id,
        })

        await user.related('followedTopics').attach([topic.id])

        return response.created(topic)
      }
    } catch (error) {
      return response.status(500)
    }
  }

  public async getName({ request, response }: HttpContext) {
    try {
      const topicSlug = request.qs().slug

      const topic = await Topic.findByOrFail('slug', topicSlug)

      return topic.name
    } catch (error) {
      return response.badRequest({ error: error.message })
    }
  }

  public async close({ request, response }: HttpContext) {
    const forumSlug = request.param('slug')

    const topic = await Topic.findByOrFail('slug', forumSlug)
    topic.isClosed = true
    await topic.save()

    return response.ok(topic)
  }

  public async open({ request, response }: HttpContext) {
    const forumSlug = request.param('slug')

    const topic = await Topic.findByOrFail('slug', forumSlug)
    topic.isClosed = false
    await topic.save()

    return response.ok(topic)
  }

  public async follow({ request, auth, response }: HttpContext) {
    const user = auth.use('jwt').user!

    const { topicId, follow } = await followValidator.validate(request.only(['topicId', 'follow']))

    const topic = await Topic.findOrFail(topicId)
    const alreadyFollowed = await user
      .related('followedTopics')
      .query()
      .where('topics.id', topicId)
      .first()

    if (follow && !alreadyFollowed) {
      await user.related('followedTopics').attach([topicId])
    } else if (!follow && alreadyFollowed) {
      await user.related('followedTopics').detach([topicId])
    }
    const topicSerialized = topic.serialize()
    topicSerialized.isFollowed = follow
    return response.ok({
      message: follow
        ? alreadyFollowed
          ? 'Już obserwujesz temat'
          : 'Temat został zaobserwowany'
        : alreadyFollowed
          ? 'Przestałeś obserwować temat'
          : 'Nie obserwowałeś tematu',
      topic: topicSerialized,
    })
  }
}
