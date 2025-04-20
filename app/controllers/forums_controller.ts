import type { HttpContext } from '@adonisjs/core/http'
import { forumsList } from '#services/forums'
import { createForumValidator, searchTopicValidator } from '#validators/forum'
import Forum from '#models/forum'
import Topic from '#models/topic'

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

  public async findTopic({ request, auth, response }: HttpContext) {
    let { filter } = await searchTopicValidator.validate(request.only(['filter']))

    if (!filter) {
      return response.badRequest({ message: 'Brakuje frazy do wyszukania.' })
    }

    filter = filter.replace(/[^a-zA-Z0-9 ]/g, '')
    filter = filter.trim()

    if (filter.length === 0) {
      return response.ok([])
    }

    const searchQuery = filter + '*'

    // const topics = await Topic.query()
    //   .withCount('posts', (topicQueryCount) => {
    //     topicQueryCount.as('postCounter')
    //   })
    //   .whereRaw(`MATCH(name) AGAINST(? IN BOOLEAN MODE)`, [searchQuery])
    //   .orderByRaw(`MATCH(name) AGAINST(? IN BOOLEAN MODE) DESC`, [searchQuery])
    //   .preload('forum')

    // return response.ok(topics)

    const forums = await Forum.query().preload('topics', (topicQuery) => {
      topicQuery
        .whereRaw(`MATCH(name) AGAINST(? IN BOOLEAN MODE)`, [searchQuery])
        .orderByRaw(`MATCH(name) AGAINST(? IN BOOLEAN MODE) DESC`, [searchQuery])
        .withCount('posts', (topicQueryCount) => {
          topicQueryCount.as('postCounter')
        })
    })
    const filteredForums = forums.filter((f) => f.topics.length > 0)

    return response.ok(filteredForums)
  }
}
