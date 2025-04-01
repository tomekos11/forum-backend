import type { HttpContext } from '@adonisjs/core/http'

import { forumsList } from '#services/forums'

export default class ForumsController {
  public async index({ response }: HttpContext) {
    return forumsList()
  }

  public async store({ response }: HttpContext) {
    return 'xD'
  }
  // public async posts({ request, auth, response }: HttpContext) {
  //   // dodaj walidator

  //   const { forumId } = await postsForForumValidator.validate(request.all())

  //   // zwróć dla
  // }
}
