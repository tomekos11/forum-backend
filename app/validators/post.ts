import db from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'
import type { FieldContext } from '@vinejs/vine/types'

export const indexPostValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    perPage: vine.number().max(25).positive().optional(),
    sortBy: vine.enum(['created_at', 'reaction_count'] as const).optional(),
    order: vine.enum(['asc', 'desc'] as const).optional(),
  })
)
export const storePostValidator = vine.compile(
  vine.object({
    content: vine.string().trim(),
    topicId: vine.number().exists({ table: 'topics', column: 'id' }),
    quotedPostId: vine
      .number()
      .exists({ table: 'posts', column: 'id' })
      .use(
        vine.createRule(async (value: unknown, _: unknown, field: FieldContext) => {
          if (typeof value !== 'number') {
            return
          }

          const topicId = field.parent.topicId

          if (!topicId || !value) return

          const quotedPost = await db.from('posts').where('id', value).select('topic_id').first()

          if (!quotedPost || quotedPost.topic_id !== topicId) {
            field.report(
              'Quoted post must belong to the same topic.',
              'quotedPostTopicMismatch',
              field
            )
          }
        })()
      )
      .optional(),
  })
)

export const editPostValidator = vine.compile(
  vine.object({
    postId: vine.number().exists({ table: 'posts', column: 'id' }),
    content: vine.string().trim(),
  })
)

export const destroyPostValidator = vine.compile(
  vine.object({
    postId: vine.number().exists({ table: 'posts', column: 'id' }),
  })
)
