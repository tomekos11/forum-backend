import Post from '#models/post'
import { BaseEvent } from '@adonisjs/core/events'

export default class MarkNotificationsRead extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public posts: Post[]) {
    super()
  }
}
