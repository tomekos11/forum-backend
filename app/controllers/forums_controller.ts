import type { HttpContext } from '@adonisjs/core/http'

import { forums } from '#services/forums'

export default class ForumsController {
  public async index({ response }: HttpContext) {
    return forums()
  }
}
