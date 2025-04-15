import vine from '@vinejs/vine'

export const createTopicValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(100),
    isPrimary: vine.boolean().nullable().optional(),
    postContent: vine.string().minLength(1).maxLength(100),
  })
)
export const indexTopicValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    perPage: vine.number().max(25).positive().optional(),
    sortBy: vine.enum(['created_at', 'posts_count', 'name', 'is_closed'] as const).optional(),
    order: vine.enum(['asc', 'desc'] as const).optional(),
    title: vine.string().optional(),
  })
)
export const followValidator = vine.compile(
  vine.object({
    topicId: vine.number().exists({ table: 'topics', column: 'id' }),
    follow: vine.boolean(),
  })
)
