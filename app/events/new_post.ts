import { BaseEvent } from '@adonisjs/core/events'
import Post from '#models/post'

export default class NewPost extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public post: Post) {
    super()
  }
}
