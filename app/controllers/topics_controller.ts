import type { HttpContext } from '@adonisjs/core/http'
import { topicsList } from '#services/topics_service'
import { createTopicValidator } from '#validators/topic'
import Topic from '#models/topic'

export default class TopicsController {
  public async index({ request, response }: HttpContext) {
    const forumSlug = request.param('slug')

    const { page = 1, perPage = 10 } = request.only(['page', 'perPage'])

    const topics = await topicsList(forumSlug, page, perPage)
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

  public async getName({ request, response }: HttpContext) {
    try {
      const topicSlug = request.qs().slug

      const topic = await Topic.findByOrFail('slug', topicSlug)

      return topic.name
    } catch (error) {
      return response.badRequest({ error: error.message })
    }
  }
}
