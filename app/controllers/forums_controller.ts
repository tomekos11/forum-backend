import type { HttpContext } from '@adonisjs/core/http'

import { forums } from '#services/forums'
import { postsForForumValidator } from '#validators/forum'

export default class ForumsController {
  public async index({ response }: HttpContext) {
    return forums()
  }

  public async posts({ request, auth, response }: HttpContext) {
    // dodaj walidator

    const { forumId } = await postsForForumValidator.validate(request.all())

    // zwróć dla
  }
}
