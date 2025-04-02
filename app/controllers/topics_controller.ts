import type { HttpContext } from '@adonisjs/core/http'
import { topicsList } from '#services/topics_service'
import { createTopicValidator } from '#validators/topic'
import Topic from '#models/topic'

export default class TopicsController {
  public async index({ request, response }: HttpContext) {
    const forumId = request.param('forumId')

    const page = request.param('page') || 1
    const perPage = request.param('perPage') || 10

    const topics = await topicsList(forumId, page, perPage)
    return response.ok(topics)
  }

  public async store({ params, request, response, auth }: HttpContext) {
    const data = request.only(['name', 'isPrimary'])
    const payload = await createTopicValidator.validate(data)

    const user = auth?.user
    const isPrimary = user?.role === 'admin' ? (payload.isPrimary ?? false) : false

    try {
      const topic = await Topic.create({
        name: payload.name,
        forumId: params.forumId,
        isPrimary: isPrimary,
      })
      return response.created({ data: topic })
    } catch (error) {
      return response.status(500)
    }
  }

  public async getName({ params, request, response }: HttpContext) {
    try {
      const topicId = request.qs().id

      console.log(topicId)

      const topic = await Topic.findOrFail(topicId)

      console.log(topic)

      return topic.name
    } catch (error) {
      return response.badRequest({ error: error.message })
    }
  }
}
