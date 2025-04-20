import type { HttpContext } from '@adonisjs/core/http'
import { forumsList } from '#services/forums'
import { createForumValidator } from '#validators/forum'
import Forum from '#models/forum'

export default class ForumsController {
  public async index({ response }: HttpContext) {
    const forums = await forumsList()
    return response.ok(forums)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['name', 'description'])
      const payload = await createForumValidator.validate(data)

      const forum = await Forum.create(payload)

      return response.created(forum)
    } catch (error) {
      return response.badRequest(error.messages)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const forum = await Forum.findOrFail(params.forumId)
      const data = request.only(['name', 'description'])
      const payload = await createForumValidator.validate(data)

      forum.merge(payload)
      await forum.save()

      return response.ok(forum)
    } catch (error) {
      return response.badRequest({ error: error.message })
    }
  }

  public async getName({ params, request, response }: HttpContext) {
    try {
      const forumSlug = request.qs().slug

      const forum = await Forum.findByOrFail('slug', forumSlug)

      return forum.name
    } catch (error) {
      return response.badRequest({ error: error.message })
    }
  }

  public async findTopic({ request, auth, response }: HttpContext) {}
}
